import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { activeAttempt, REASON_CODE, saveLedger } from '../../branch/nightly/ledger.mjs';
import { recordPublication } from '../../branch/publication/ledger.mjs';

export async function failed(state, flags) {
  const { attempt, ledger } = activeAttempt(state, flags['run-id']);
  if (!REASON_CODE.test(flags.reason || ''))
    throw new Error('Use a short failure code; keep private diagnostics in the run report');
  const publication = readJSON(at('.state/publication.json'), {});
  if (
    publication.lastRun?.id === attempt.publicationRunId &&
    publication.lastRun.outcome === 'published'
  )
    throw new Error('Reconcile successful publication; do not mark it failed to clear a run');
  if (
    publication.lastRun?.id !== attempt.publicationRunId ||
    publication.lastRun.outcome !== 'failed'
  )
    await recordPublication({
      phase: 'failed',
      runId: attempt.publicationRunId,
      trigger: attempt.trigger,
    });
  attempt.phase = 'failed';
  attempt.reason = flags.reason;
  attempt.completedAt = now();
  ledger.lastFailure = { id: attempt.id, at: attempt.completedAt, reason: flags.reason };
  ledger.retryAfter = new Date(Date.now() + 3600000).toISOString();
  delete state.active;
  saveLedger(state, attempt);
  return attempt;
}
