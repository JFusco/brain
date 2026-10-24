import crypto from 'node:crypto';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { claimRefusal, REASON_CODE, saveLedger } from '../../branch/nightly/ledger.mjs';
import { recordPublication } from '../../branch/publication/ledger.mjs';
import { checkVocabularyRelease } from '../../vocabulary.mjs';
import { checkUiPatternsRelease } from '../../ui-patterns.mjs';

export async function claim(state, slotDate, flags) {
  if (!['manual', 'scheduled-agent'].includes(flags.trigger))
    throw new Error('Record the actual invocation trigger');
  const rerun = flags.rerun !== undefined;
  if (rerun && (flags.trigger !== 'manual' || !REASON_CODE.test(flags.rerun)))
    throw new Error('A rerun requires --trigger manual and --rerun <short-reason-code>');
  const ledger = rerun ? (state.manual ||= { completed: {}, attempts: {} }) : state;
  const refusal = claimRefusal(state, ledger, slotDate, { rerun });
  if (refusal) return refusal;
  const previous = readJSON(at('.state/publication.json'), {});
  if (previous.activeRun)
    return {
      claimed: false,
      reason: 'publication-needs-reconciliation',
      active: previous.activeRun,
    };
  if (
    typeof flags['author-id'] !== 'string' ||
    !flags['author-id'].trim() ||
    flags['author-id'].length > 200
  )
    throw new Error('Record the actual author agent identity with --author-id');
  const publication = await recordPublication({ phase: 'started', trigger: flags.trigger });
  const attempt = {
    id: crypto.randomUUID(),
    slotDate,
    startedAt: now(),
    trigger: flags.trigger,
    publicationRunId: publication.runId,
    phase: 'started',
    protocolVersion: 2,
    authorId: flags['author-id'],
    ...(rerun ? { mode: 'manual-rerun', rerunReason: flags.rerun } : {}),
  };
  state.active = attempt;
  ledger.attempts[slotDate] = (ledger.attempts[slotDate] || 0) + 1;
  saveLedger(state, attempt);
  // Advisory metadata only: preserve the claimed run and routine catalog scope.
  try {
    attempt.vocabulary = await checkVocabularyRelease();
  } catch (error) {
    attempt.vocabulary = { ok: false, error: error.message };
  }
  try {
    attempt.uiPatterns = await checkUiPatternsRelease();
  } catch (error) {
    attempt.uiPatterns = { ok: false, error: error.message };
  }
  saveLedger(state, attempt);
  return { claimed: true, ...attempt };
}
