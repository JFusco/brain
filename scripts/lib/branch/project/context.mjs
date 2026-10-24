import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { noSymlinks, inside } from '../../leaf/fs-safe.mjs';
import { json } from '../../leaf/json.mjs';
import { packageName, versionConstraint } from './versions.mjs';

export function projectDirectory(input, workspace) {
  if (!input) throw new Error('--project <path> is required');
  const root = fs.realpathSync(path.resolve(input)),
    selected = workspace ? path.resolve(root, workspace) : root;
  if (!inside(root, selected)) throw new Error('Workspace must stay inside the supplied project');
  noSymlinks(root, selected);
  return selected;
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
