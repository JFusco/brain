import { writeJSON } from '../../leaf/fs-safe.mjs';
import { ROOT } from '../../leaf/paths.mjs';
import { git } from '../../branch/platform/git.mjs';
import { branchFile } from '../../branch/nightly/paths.mjs';
import { primary, registered, cleanHead } from '../../branch/nightly/run.mjs';

export function rebase({ runId, worktree }) {
  primary();
  const entry = registered(worktree, runId);
  cleanHead(entry.worktree);
  git(ROOT, 'fetch', 'origin', 'main');
  const baseSha = git(ROOT, 'rev-parse', 'origin/main').toString().trim();
  git(entry.worktree, 'rebase', baseSha);
  entry.baseSha = baseSha;
  writeJSON(branchFile(entry.branch), entry, 0o600);
  return { ...entry, notice: 'Review the resulting head and run prepare again before publication' };
}
