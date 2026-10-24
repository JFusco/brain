import { writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { now, HOUR } from '../../leaf/time.mjs';
import { privateFile, approvalFile } from '../../branch/nightly/paths.mjs';
import { primary, registered, cleanHead, remoteBase } from '../../branch/nightly/run.mjs';
import { publicationScope } from '../../branch/nightly/scope.mjs';
import { validateReview } from '../../branch/nightly/review.mjs';
import { checks } from '../../branch/nightly/checks.mjs';

export function prepare({ runId, worktree, file }) {
  primary();
  const entry = registered(worktree, runId),
    head = cleanHead(entry.worktree);
  if (entry.baseSha !== remoteBase())
    throw new Error('Main changed; update the branch and register a fresh base before reviewing');
  const { files, notes } = publicationScope(entry, head),
    review = readJSON(file, null);
  // Preserve even rejected or malformed review evidence without publishing it.
  writeJSON(privateFile(`reviews/${runId}/${head}-${Date.now()}.json`), review, 0o600);
  validateReview(review, entry, head, notes);
  const results = checks(entry.worktree, head),
    preparedAt = now();
  const receipt = {
    ...entry,
    headSha: head,
    files,
    notes,
    review,
    checks: results,
    preparedAt,
    expiresAt: new Date(
      Math.min(Date.parse(review.reviewedAt), Date.parse(preparedAt)) + HOUR,
    ).toISOString(),
  };
  writeJSON(approvalFile(runId, head), receipt, 0o600);
  return { runId, headSha: head, files, notes, preparedAt, expiresAt: receipt.expiresAt };
}
