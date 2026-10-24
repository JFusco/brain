import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { inside, noSymlinks } from './leaf/fs-safe.mjs';
import { json } from './leaf/json.mjs';

const packageName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/i;
const literal = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?$/;
export function projectDirectory(input, workspace) {
  if (!input) throw new Error('--project <path> is required');
  const root = fs.realpathSync(path.resolve(input)),
    selected = workspace ? path.resolve(root, workspace) : root;
  if (!inside(root, selected)) throw new Error('Workspace must stay inside the supplied project');
  noSymlinks(root, selected);
  return selected;
}
export function versionConstraint(value) {
  const match = String(value).match(/^(.+)@(>=)?(\d+(?:\.\d+){0,2})$/);
  if (!match || !packageName.test(match[1]))
    throw new Error('Version constraints use package@major[.minor.patch] or package@>=version');
  return {
    name: match[1],
    minimum: !!match[2],
    version: match[3],
    parts: match[3].split('.').map(Number),
  };
}

export function projectContext(input, { workspace, versions } = {}) {
  const dependencies = {},
    context = { dependencies, workspaceSelectionRequired: false };
  if (workspace && !input) throw new Error('--workspace requires --project');
  if (input) {
    const root = fs.realpathSync(path.resolve(input)),
      selected = projectDirectory(input, workspace);
    Object.defineProperty(context, 'selectedRoot', { value: selected, enumerable: false });
    const file = path.join(selected, 'package.json');
    noSymlinks(root, file);
    if (!fs.statSync(file).isFile() || fs.statSync(file).size > 1024 * 1024)
      throw new Error('Project package.json must be a bounded regular file');
    const manifest = json(file),
      resolver = createRequire(file);
    context.workspace = path.relative(root, selected) || '.';
    context.workspaceSelectionRequired =
      !workspace &&
      !!(manifest.workspaces || fs.existsSync(path.join(root, 'pnpm-workspace.yaml')));
    for (const [name, declared] of Object.entries({
      ...manifest.peerDependencies,
      ...manifest.devDependencies,
      ...manifest.dependencies,
    })) {
      if (!packageName.test(name)) continue;
      let version = null,
        packageFile = null;
      try {
        packageFile = resolver.resolve(name + '/package.json');
      } catch {
        // Package exports can hide package.json. Resolve without executing code,
        // then read only the matching package's bounded manifest.
        try {
          let directory = path.dirname(resolver.resolve(name));
          for (let depth = 0; depth < 12; depth++) {
            const candidate = path.join(directory, 'package.json');
            if (
              fs.existsSync(candidate) &&
              fs.statSync(candidate).size <= 1024 * 1024 &&
              json(candidate).name === name
            ) {
              packageFile = candidate;
              break;
            }
            const parent = path.dirname(directory);
            if (parent === directory) break;
            directory = parent;
          }
        } catch {
          /* unresolvable: version stays declared-only */
        }
      }
      if (packageFile)
        try {
          if (fs.statSync(packageFile).size <= 1024 * 1024) {
            const installed = json(packageFile);
            if (installed.name === name && typeof installed.version === 'string')
              version = installed.version;
          }
        } catch {
          /* unreadable manifest: version stays declared-only */
        }
      dependencies[name] = {
        declared: String(declared),
        version,
        confidence: version ? 'installed' : 'declared-only',
      };
      if (name === 'next' && version && packageFile) {
        const docs = path.join(path.dirname(packageFile), 'dist/docs');
        if (fs.existsSync(docs) && fs.statSync(docs).isDirectory())
          Object.defineProperty(context, 'installedDocs', {
            value: { root: fs.realpathSync(docs), package: 'next', version },
            enumerable: false,
          });
      }
    }
  }
  if (versions)
    for (const value of String(versions).split(',')) {
      const parsed = versionConstraint(value.trim());
      if (parsed.minimum) throw new Error('Explicit target versions must be literal, not ranges');
      if (dependencies[parsed.name]?.confidence === 'explicit')
        throw new Error('Duplicate explicit package version');
      if (dependencies[parsed.name]?.version)
        throw new Error('Explicit versions cannot override an installed dependency');
      dependencies[parsed.name] = {
        ...dependencies[parsed.name],
        version: parsed.version,
        confidence: 'explicit',
      };
    }
  return context;
}

export function versionFit(constraints, context) {
  if (!constraints?.length)
    return {
      status: 'unconfirmed',
      reason: 'This reference has no explicit package-version constraints',
    };
  let matched = 0;
  const unknown = [];
  for (const value of constraints) {
    const rule = versionConstraint(value),
      dependency = context.dependencies[rule.name];
    if (!dependency?.version || !literal.test(dependency.version)) {
      unknown.push(rule.name);
      continue;
    }
    const actual = dependency.version.split('.').map(Number),
      shared = Math.min(actual.length, rule.parts.length);
    let comparison = 0;
    for (let index = 0; index < shared; index++)
      if (actual[index] !== rule.parts[index]) {
        comparison = Math.sign(actual[index] - rule.parts[index]);
        break;
      }
    if (rule.minimum ? comparison < 0 : comparison !== 0)
      return {
        status: 'incompatible',
        reason: `${rule.name} ${dependency.version} does not match ${rule.minimum ? '>=' : ''}${rule.version}`,
      };
    if (rule.minimum && comparison > 0) matched++;
    else if (actual.length < rule.parts.length) unknown.push(rule.name);
    else matched++;
  }
  return unknown.length
    ? {
        status: 'unconfirmed',
        reason: 'Exact target versions are not established for ' + unknown.join(', '),
      }
    : {
        status: 'matched',
        reason: `Explicit version constraints matched for ${matched} package(s)`,
      };
}
