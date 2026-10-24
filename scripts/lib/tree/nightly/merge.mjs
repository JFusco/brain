import { writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { now } from '../../leaf/time.mjs';
import { gh, repository } from '../../branch/platform/github-cli.mjs';
import { privateFile, approvalFile } from '../../branch/nightly/paths.mjs';
import { primary, registered, cleanHead } from '../../branch/nightly/run.mjs';
import { approved, verifyApproval } from '../../branch/nightly/receipts.mjs';

export function merge({ runId, worktree, pr }) {
  primary();
  if (!/^[1-9]\d*$/.test(pr || '')) throw new Error('Provide the exact PR number');
  const entry = registered(worktree, runId),
    head = cleanHead(entry.worktree),
    repo = repository();
  const saved = JSON.parse(gh('api', `repos/${repo}/pulls/${pr}`));
  // An interrupted successful merge reconciles its existing receipt rather than merging again.
  if (saved.merged_at) {
    verifyApproval(
      runId,
      {
        number: Number(pr),
        headSha: saved.head.sha,
        files: readJSON(approvalFile(runId, saved.head.sha), {}).files,
      },
      saved,
    );
    return {
      number: Number(pr),
      headSha: saved.head.sha,
      mergedAt: saved.merged_at,
      reconciled: true,
    };
  }
  approved(entry.worktree, runId, head);
  if (
    saved.state !== 'open' ||
    saved.draft ||
    saved.head.sha !== head ||
    saved.head.ref !== entry.branch ||
    saved.head.repo?.full_name !== repo ||
    saved.base.ref !== 'main' ||
    saved.base.sha !== entry.baseSha
  )
    throw new Error('Saved PR does not match the approved head, branch, repository and base');
  const runs = JSON.parse(
    gh(
      'api',
      `repos/${repo}/actions/workflows/wiki-check.yml/runs?head_sha=${head}&event=pull_request&per_page=100`,
    ),
  ).workflow_runs;
  // GitHub may omit PR associations, even on successful pull_request runs.
  const latest = runs
    ?.filter(
      r =>
        r.head_sha === head &&
        r.head_branch === entry.branch &&
        r.head_repository?.full_name === repo &&
        r.event === 'pull_request',
    )
    .sort((a, b) => b.run_number - a.run_number || b.run_attempt - a.run_attempt)[0];
  if (!latest || latest.status !== 'completed' || latest.conclusion !== 'success')
    throw new Error('Wiki integrity must pass on the exact PR head before merge');
  // Check again immediately before invoking GitHub; do not bypass branch protection.
  const receipt = approved(entry.worktree, runId, head);
  writeJSON(
    privateFile(`merges/${runId}/${pr}.json`),
    {
      runId,
      number: Number(pr),
      headSha: head,
      baseSha: entry.baseSha,
      preparedAt: receipt.preparedAt,
      checkedAt: now(),
      wikiRun: { id: latest.id, headSha: latest.head_sha, conclusion: latest.conclusion },
    },
    0o600,
  );
  gh('pr', 'merge', pr, '--repo', repo, '--squash', '--match-head-commit', head);
  const merged = JSON.parse(gh('api', `repos/${repo}/pulls/${pr}`));
  verifyApproval(
    runId,
    { number: Number(pr), headSha: head, files: readJSON(approvalFile(runId, head)).files },
    merged,
  );
  return { number: Number(pr), headSha: head, mergedAt: merged.merged_at };
}
