import fs from 'node:fs';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { activeAttempt, saveLedger } from '../../branch/nightly/ledger.mjs';
import { verifyMerged } from '../../branch/nightly/merged.mjs';
import { completionChecks } from '../../branch/nightly/receipts.mjs';
import { validateReport } from '../../branch/nightly/report.mjs';
import { recordPublication } from '../../branch/publication/ledger.mjs';

export async function complete(state, flags) {
  const { attempt, ledger } = activeAttempt(state, flags['run-id']);
  const report = readJSON(flags.file, null);
  validateReport(report, attempt);
  const merged = [];
  for (const item of report.prs) merged.push(await verifyMerged(item, attempt));
  if (attempt.protocolVersion === 2) report.verification = completionChecks(attempt.id, merged);
  const receipt = at(`.state/nightly/reports/${attempt.id}.json`);
  writeJSON(receipt, report, 0o600);
  const publication = readJSON(at('.state/publication.json'), {});
  if (
    publication.lastRun?.id !== attempt.publicationRunId ||
    publication.lastRun.outcome !== report.outcome
  )
    await recordPublication({
      phase: 'completed',
      runId: attempt.publicationRunId,
      trigger: attempt.trigger,
      outcome: report.outcome,
      pr: merged.at(-1)?.number,
    });
  attempt.phase = 'completed';
  attempt.completedAt = now();
  attempt.outcome = report.outcome;
  attempt.reportSha256 = sha(fs.readFileSync(receipt));
  attempt.prs = merged;
  ledger.completed[attempt.mode === 'manual-rerun' ? attempt.id : attempt.slotDate] = attempt;
  delete state.active;
  delete ledger.retryAfter;
  saveLedger(state, attempt);
  return attempt;
}
