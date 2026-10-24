import fs from 'node:fs';
import path from 'node:path';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { now } from '../../leaf/time.mjs';
import { git, coordinator } from '../../branch/platform/git.mjs';
import { privateFile } from '../../branch/nightly/paths.mjs';
import { activeRun, primary, cleanHead, remoteBase } from '../../branch/nightly/run.mjs';
import { checks } from '../../branch/nightly/checks.mjs';

export function verify({ runId, worktree }) {
  primary();
  activeRun(runId);
  const cwd = fs.realpathSync(worktree);
  if (
    path.dirname(
      git(cwd, 'rev-parse', '--path-format=absolute', '--git-common-dir').toString().trim(),
    ) !== coordinator()
  )
    throw new Error('Verification must use a Brain checkout');
  const headSha = cleanHead(cwd);
  if (headSha !== remoteBase())
    throw new Error('Final verification requires the current committed main state');
  const record = { runId, headSha, checks: checks(cwd, headSha), completedAt: now() };
  writeJSON(privateFile(`verification/${runId}.json`), record, 0o600);
  return {
    runId,
    headSha,
    completedAt: record.completedAt,
    checks: record.checks.map(({ output, ...c }) => c),
  };
}
