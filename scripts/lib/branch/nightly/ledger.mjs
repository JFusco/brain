import { writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';

const LEDGER = at('.state/nightly.json');
export const REASON_CODE = /^[a-z][a-z0-9-]{0,63}$/;
export const MAX_ATTEMPTS = 3;

export const loadLedger = () => readJSON(LEDGER, { schemaVersion: 1, completed: {}, attempts: {} });
export function saveLedger(state, attempt) {
  if (attempt) writeJSON(at(`.state/nightly/runs/${attempt.id}.json`), attempt, 0o600);
  writeJSON(LEDGER, state, 0o600);
}

// Why a claim must not start now, or null when it may. `ledger` is the scheduled or manual ledger.
export function claimRefusal(state, ledger, slotDate, { rerun = false, now = Date.now() } = {}) {
  if (state.active)
    return { claimed: false, reason: 'active-run-needs-reconciliation', active: state.active };
  if (!rerun && state.completed[slotDate]) return { claimed: false, reason: 'completed', slotDate };
  if ((ledger.attempts[slotDate] || 0) >= MAX_ATTEMPTS)
    return {
      claimed: false,
      reason: rerun ? 'manual-retry-limit' : 'daily-retry-limit',
      slotDate,
      lastFailure: ledger.lastFailure,
    };
  if (Date.parse(ledger.retryAfter) > now)
    return { claimed: false, reason: 'backoff', retryAfter: ledger.retryAfter };
  return null;
}

export function activeAttempt(state, runId) {
  const attempt = state.active;
  if (!attempt || attempt.id !== runId)
    throw new Error('The exact active nightly run ID is required');
  return { attempt, ledger: attempt.mode === 'manual-rerun' ? state.manual : state };
}
