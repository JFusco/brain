import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../../leaf/paths.mjs';

// Git adapters. Failures surface as errors; stderr is not echoed.
export function execute(command, argv, cwd = ROOT) {
  const r = spawnSync(command, argv, { cwd, maxBuffer: 32 * 1024 * 1024, timeout: 180000 });
  if (r.status !== 0)
    throw new Error(
      `Required ${path.basename(command)} operation failed (exit ${r.status ?? 'unavailable'}); preserve local diagnostics`,
    );
  return r.stdout;
}
export const git = (cwd, ...argv) => execute('git', argv, cwd);
export function coordinator() {
  return path.dirname(
    git(ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir').toString().trim(),
  );
}
export function blob(cwd, ref, file) {
  const exists = spawnSync('git', ['cat-file', '-e', `${ref}:${file}`], { cwd, stdio: 'ignore' });
  if (exists.status === 1 || exists.status === 128) return null;
  if (exists.status !== 0) throw new Error('Cannot read reviewed content');
  const mode = git(cwd, 'ls-tree', ref, '--', file).toString().split(' ')[0];
  if (mode !== '100644' && mode !== '100755')
    throw new Error('Nightly publication cannot contain symlinks or submodules');
  return git(cwd, 'show', `${ref}:${file}`);
}
