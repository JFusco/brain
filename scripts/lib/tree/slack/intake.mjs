import { existsSync } from 'node:fs';
import { referenceReceipt } from './reference.mjs';
import { config } from '../../branch/platform/config.mjs';
import { DAY } from '../../leaf/time.mjs';
import { previewState, work, advance, INVENTORY } from '../../branch/slack/work.mjs';
import { validResourceMap, evidence } from '../../branch/slack/evidence.mjs';
import { capture, captureReceipt } from '../capture/capture.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';
import { noSymlinks, writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { sha } from '../../leaf/hash.mjs';

const location = name => at('.state/slack/' + name + '.json');
const rosterFile = location('channels');
const stateFile = location('progress');
const safeRead = (file, fallback) => {
  noSymlinks(ROOT, file);
  return readJSON(file, fallback);
};
export const configured = () => existsSync(rosterFile);

export function roster() {
  const channels = safeRead(rosterFile, []);
  if (
    channels.length !== 8 ||
    new Set(channels.map(c => c.id)).size !== channels.length ||
    !channels.every(c => /^C[A-Z0-9]{8,}$/.test(c.id) && config().domains.includes(c.domain))
  )
    throw new Error('Expected eight distinct configured Slack channels with known domains');
  return channels;
}
export function slackWork(run, action, input) {
  if (run.trigger !== 'scheduled-agent' || run.mode)
    throw new Error('Use the scheduled nightly claim');
  const channels = roster();
  const state = safeRead(stateFile, null);
  const rosterHash = sha(JSON.stringify(channels));
  if (state && state.rosterHash !== rosterHash)
    throw new Error('Slack roster changed; reconcile its prior coverage');
  if (!state) {
    if (action === 'work') return { mode: 'preview', cutoff: run.startedAt, channels };
    if (action !== 'preview') throw new Error('Worker preview required');
    const next = previewState(channels, input, run.startedAt, run.authorId);
    writeJSON(
      location('preview-' + run.id),
      { runId: run.id, cutoff: run.startedAt, ...input },
      0o600,
    );
    if (next.ready) writeJSON(stateFile, { ...next, rosterHash, previewRun: run.id }, 0o600);
    return {
      ready: next.ready,
      windows: Object.fromEntries(Object.entries(next.channels).map(([id, c]) => [id, c.start])),
    };
  }
  if (state.pending) {
    const { requestId, ...source } = state.pending;
    const prior = captureReceipt(requestId);
    if (prior.found) state.receipts[requestId] = { ...source, candidate: prior.id };
    delete state.pending;
    writeJSON(stateFile, state, 0o600);
  }
  if (action === 'preview') throw new Error('The worker preview has already succeeded');
  if (!['work', 'page'].includes(action)) throw new Error('Unknown Slack operation');
  if (state.batch?.date !== run.slotDate) {
    state.batch = { date: run.slotDate, offset: state.rotation, through: run.startedAt };
    // Move one pair each day, including when a selected seed stream is inaccessible.
    state.rotation = (state.rotation + 2) % channels.length;
    writeJSON(stateFile, state, 0o600);
  }
  const tasks = work(state, channels, run);
  if (action === 'work')
    return {
      mode: 'intake',
      tasks,
      gaps: Object.fromEntries(channels.map(c => [c.id, state.channels[c.id].gaps])),
      reviewDue: !state.review && Date.parse(run.startedAt) >= Date.parse(state.cutoff) + 14 * DAY,
    };
  const task = tasks.find(t => t.token === input.token);
  if (!task) throw new Error('Stale or unexpected Slack page; reload work');
  if (input.gap !== undefined) {
    if (
      ![
        'unavailable',
        'rate-limited',
        'incomplete',
        'cursor-expired',
        'reference-unavailable',
      ].includes(input.gap)
    )
      throw new Error('Invalid coverage gap');
  } else {
    if (
      !(
        input.next === null ||
        (typeof input.next === 'string' &&
          input.next.length > 0 &&
          input.next.length <= 4096 &&
          input.next !== task.cursor)
      ) ||
      !Array.isArray(input.lessons) ||
      input.lessons.length > 100 ||
      (INVENTORY.includes(task.stream) && !validResourceMap(input.revisions))
    )
      throw new Error('Incomplete Slack page receipt');
    const domain = channels.find(c => c.id === task.channel).domain;
    const candidates = input.lessons.map(item =>
      evidence(item, task, run, domain, referenceReceipt(run, item.reference, item.checkedAt)),
    );
    for (const candidate of candidates) {
      const { requestId, permalink, body } = candidate;
      // Capture and this checkpoint share the CLI mutation lock. Recover a previous
      // inbox write before submitting any regenerated summary after an interruption.
      state.pending = { requestId, permalink, channel: task.channel, domain };
      writeJSON(stateFile, state, 0o600);
      const prior = captureReceipt(requestId);
      const receipt = prior.found ? prior : capture(body, { domain, requestId });
      state.receipts[requestId] = {
        candidate: receipt.id,
        permalink,
        channel: task.channel,
        domain,
      };
      delete state.pending;
    }
  }
  advance(state, task, input, run);
  writeJSON(stateFile, state, 0o600);
  return { recorded: true, gap: input.gap ?? null };
}

export function slackSummary() {
  const state = safeRead(stateFile, null);
  if (!state) return { mode: configured() ? 'awaiting-worker-preview' : 'unconfigured' };
  return {
    mode: 'intake',
    cutoff: state.cutoff,
    reviewAt: new Date(Date.parse(state.cutoff) + 14 * DAY).toISOString(),
    channels: Object.entries(state.channels).map(([channel, p]) => ({
      channel,
      seedStart: p.start,
      seedThrough: p.seed,
      liveThrough: p.live,
      gaps: p.gaps,
    })),
    requests: Object.keys(state.receipts),
    review: state.review ?? null,
  };
}

export function savePilotReview(run, input) {
  const state = safeRead(stateFile, null);
  if (
    !state ||
    run.trigger !== 'scheduled-agent' ||
    run.mode ||
    Date.parse(run.startedAt) < Date.parse(state.cutoff) + 14 * DAY
  )
    throw new Error('Slack pilot review is not due');
  if (state.review) return state.review;
  if (
    !Number.isFinite(input.minutes) ||
    input.minutes < 0 ||
    !Array.isArray(input.publications) ||
    !input.publications.every(
      p => typeof p === 'string' && /^knowledge\/[a-z0-9/-]+\.md$/.test(p),
    ) ||
    !['retain', 'adjust'].includes(input.batchDecision)
  )
    throw new Error('Record measured review minutes, mapped publications and batch decision');
  const publications = [
    ...new Set(
      Object.keys(state.receipts).flatMap(id => captureReceipt(id).publications.map(p => p.path)),
    ),
  ].sort();
  if (JSON.stringify(publications) !== JSON.stringify([...new Set(input.publications)].sort()))
    throw new Error('Pilot publications must match accepted-capture mappings');
  state.review = {
    runId: run.id,
    minutes: input.minutes,
    publications,
    batchDecision: input.batchDecision,
    seed: slackSummary().channels.map(({ channel, seedStart, seedThrough }) => ({
      channel,
      seedStart,
      seedThrough,
    })),
  };
  writeJSON(stateFile, state, 0o600);
  return state.review;
}
