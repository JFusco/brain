import { config } from './config.mjs';
import { execute, git, coordinator } from './git.mjs';

export function gh(...argv) {
  return execute(config().toolchain.gh, argv, coordinator()).toString().trim();
}
export function repository() {
  const origin = git(coordinator(), 'remote', 'get-url', 'origin').toString().trim();
  const repo = origin.match(
    /^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/,
  )?.[1];
  if (!repo) throw new Error('Cannot establish Brain repository identity');
  return repo;
}
