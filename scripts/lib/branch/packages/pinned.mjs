import fs from 'node:fs';
import { noSymlinks, safePath } from '../../leaf/fs-safe.mjs';
import { json, parseJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { STABLE_SEMVER } from '../../leaf/semver.mjs';

// Bounded reads from a dependency pinned exactly in Brain's package.json; package code never runs.
export function pinnedPackage(name, label, { maxBytes }) {
  function file(relative, limit = maxBytes) {
    const target = at(`node_modules/${name}/${safePath(relative)}`);
    noSymlinks(at('.'), target);
    if (!fs.existsSync(target))
      throw new Error(`${label} is unavailable; run pnpm install --frozen-lockfile in Brain`);
    if (!fs.statSync(target).isFile() || fs.statSync(target).size > limit)
      throw new Error(`${label} file exceeds its bound`);
    return fs.readFileSync(target);
  }
  function identity() {
    const expected = json(at('package.json')).dependencies[name],
      installed = parseJSON(file('package.json'));
    if (!STABLE_SEMVER.test(expected) || installed.name !== name || installed.version !== expected)
      throw new Error(
        `${label} differs from the exact Brain dependency pin; run pnpm install --frozen-lockfile`,
      );
    return { package: name, version: expected };
  }
  return { file, identity };
}
