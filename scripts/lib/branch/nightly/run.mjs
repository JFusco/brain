import fs from 'node:fs';
import path from 'node:path';
import { readJSON } from '../../leaf/json.mjs';
import { ROOT } from '../../leaf/paths.mjs';
import { git, coordinator } from '../platform/git.mjs';
import { branchFile } from './paths.mjs';

export function activeRun(runId) {
  const attempt = readJSON(path.join(coordinator(), '.state/nightly.json'), {}).active;
  if (!attempt || attempt.id !== runId || attempt.protocolVersion !== 2)
    throw new Error('The original active version 2 nightly run is required');
  return attempt;
}
export function primary() {
  if (fs.realpathSync(ROOT) !== fs.realpathSync(coordinator()))
    throw new Error('Run nightly publication commands from the primary checkout');
}
export function registered(worktree, runId) {
  const cwd = fs.realpathSync(worktree),
    branch = git(cwd, 'symbolic-ref', '--short', 'HEAD').toString().trim();
  const entry = readJSON(branchFile(branch), null);
  if (!entry || entry.runId !== runId || entry.worktree !== cwd)
    throw new Error('Use the temporary checkout registered for this run');
  activeRun(runId);
  return entry;
}
export function cleanHead(cwd) {
  if (git(cwd, 'status', '--porcelain', '--untracked-files=all').length)
    throw new Error('Uncommitted changes invalidate nightly publication approval');
  return git(cwd, 'rev-parse', 'HEAD').toString().trim();
}
export function remoteBase() {
  return git(coordinator(), 'ls-remote', 'origin', 'refs/heads/main')
    .toString()
    .trim()
    .split(/\s+/)[0];
}
