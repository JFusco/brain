import crypto from 'node:crypto';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { overdue, now } from '../../leaf/time.mjs';
import { mergedBrainPR } from './merged-pr.mjs';

export async function recordPublication({ phase, runId, outcome, pr, trigger = 'manual' } = {}) {
  const file = at('.state/publication.json'),
    state = readJSON(file, {});
  if (!['manual', 'scheduled-agent'].includes(trigger))
    throw new Error('Publication trigger must be manual or scheduled-agent');
  if (phase === 'started') {
    if (state.activeRun && !overdue(state.activeRun.startedAt, 2))
      throw new Error('A publication run is already active; reconcile it before starting another');
    if (state.activeRun) state.lastAbandonedRun = state.activeRun;
    state.activeRun = { id: crypto.randomUUID(), startedAt: now(), trigger };
    state.lastAttempt = now();
    state.trigger = trigger;
    writeJSON(file, state, 0o600);
    return { runId: state.activeRun.id, started: true, trigger };
  }
  if (!['completed', 'failed'].includes(phase) || !runId || state.activeRun?.id !== runId)
    throw new Error('Completion requires the active publication run ID');
  if (phase === 'completed') {
    if (!['published', 'unchanged'].includes(outcome))
      throw new Error('Completion outcome must be published or unchanged');
    if (outcome === 'published') {
      if (!/^[1-9]\d*$/.test(String(pr || '')))
        throw new Error('Published completion requires --pr');
      const saved = await mergedBrainPR(pr);
      state.lastPr = Number(pr);
      state.lastMergeCommit = saved.merge_commit_sha;
    } else if (pr) throw new Error('Unchanged publication cannot cite a new merged PR');
    state.lastSuccess = now();
    state.lastOutcome = outcome;
  } else state.lastOutcome = 'failed';
  state.lastCompletedAt = now();
  state.lastRun = {
    ...state.activeRun,
    outcome: state.lastOutcome,
    completedAt: state.lastCompletedAt,
  };
  delete state.activeRun;
  writeJSON(file, state, 0o600);
  return { runId, phase, outcome: state.lastOutcome, trigger: state.trigger };
}
