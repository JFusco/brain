import { readJSON } from '../../leaf/json.mjs';
import { HOUR } from '../../leaf/time.mjs';
import { git, coordinator } from '../platform/git.mjs';
import { privateFile, approvalFile } from './paths.mjs';
import { registered, cleanHead, remoteBase } from './run.mjs';
import { publicationScope } from './scope.mjs';
import { CHECKS } from './checks.mjs';

export function approved(worktree, runId, head) {
  const entry = registered(worktree, runId);
  if (cleanHead(entry.worktree) !== head)
    throw new Error('The publication head differs from the approved commit');
  const receipt = readJSON(approvalFile(runId, head), null);
  if (
    !receipt ||
    receipt.branch !== entry.branch ||
    receipt.baseSha !== entry.baseSha ||
    Date.parse(receipt.expiresAt) <= Date.now()
  )
    throw new Error(
      'Run prepare with a fresh exact-head review and executed checks before publication',
    );
  if (receipt.baseSha !== remoteBase())
    throw new Error('Main changed; fresh review and checks are required');
  if (JSON.stringify(publicationScope(entry, head).files) !== JSON.stringify(receipt.files))
    throw new Error('Approved file scope differs from the publication');
  return receipt;
}
export function verifyApproval(runId, item, pr) {
  const receipt = readJSON(approvalFile(runId, item.headSha), null),
    intent = readJSON(privateFile(`merges/${runId}/${item.number}.json`), null),
    mergedAt = Date.parse(pr.merged_at);
  // GitHub's merge timestamp has second precision; compare start times at that precision.
  const second = value => Math.floor(Date.parse(value) / 1000);
  if (
    !receipt ||
    !Number.isFinite(mergedAt) ||
    pr.head.sha !== receipt.headSha ||
    pr.head.ref !== receipt.branch ||
    pr.base.ref !== 'main' ||
    pr.base.sha !== receipt.baseSha ||
    second(receipt.preparedAt) > second(pr.merged_at) ||
    Date.parse(receipt.expiresAt) < mergedAt ||
    JSON.stringify(receipt.files) !== JSON.stringify(item.files)
  )
    throw new Error('Merged PR lacks a matching fresh prepublication approval and check receipt');
  if (
    intent?.headSha !== receipt.headSha ||
    intent.preparedAt !== receipt.preparedAt ||
    intent.wikiRun?.conclusion !== 'success' ||
    intent.wikiRun.headSha !== receipt.headSha ||
    second(intent.checkedAt) > second(pr.merged_at)
  )
    throw new Error('Reconcile the guarded merge and its exact-head Wiki evidence');
  return receipt;
}
export function completionChecks(runId, merged) {
  const receipt = readJSON(privateFile(`verification/${runId}.json`), null);
  if (
    !receipt ||
    !CHECKS.every(command =>
      receipt.checks?.some(
        c => c.command === command && c.exitCode === 0 && c.headSha === receipt.headSha,
      ),
    ) ||
    Date.now() - Date.parse(receipt.completedAt) > HOUR
  )
    throw new Error('Run verify to execute fresh local checks on the final committed state');
  for (const pr of merged)
    git(coordinator(), 'merge-base', '--is-ancestor', pr.mergeCommit, receipt.headSha);
  return receipt;
}
