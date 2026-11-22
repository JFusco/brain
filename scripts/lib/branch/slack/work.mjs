import { sha } from '../../leaf/hash.mjs';
import { DAY } from '../../leaf/time.mjs';
export const HISTORY = ['messages', 'replies', 'files'];
export const INVENTORY = ['pins', 'bookmarks', 'canvases'];
export const STREAMS = [...HISTORY, ...INVENTORY];
export const SEED_CHANNELS_PER_NIGHT = 4;
const SEED_DAYS = 28;
const LEGACY_SEED_DAYS = 7;
const iso = time => new Date(time).toISOString();

export function previewState(channels, report, cutoff, authorId) {
  if (report.authorId !== authorId || report.rows?.length !== channels.length)
    throw new Error('Preview requires the scheduled author and every configured channel');
  const end = Date.parse(cutoff);
  const result = {};
  for (const { id } of channels) {
    const row = report.rows.find(item => item.channel === id);
    if (
      !row ||
      typeof row.messagesRead !== 'boolean' ||
      typeof row.threadAccess !== 'boolean' ||
      ![...INVENTORY, 'files'].every(key =>
        ['read', 'empty', 'unverified'].includes(row.resources?.[key]),
      )
    )
      throw new Error('Incomplete channel preview');
    if (!row.messagesRead) {
      result[id] = { start: null };
      continue;
    }
    if (
      !Number.isInteger(row.posts) ||
      row.posts < 0 ||
      !Number.isFinite(Date.parse(row.createdAt)) ||
      Date.parse(row.createdAt) > end
    )
      throw new Error('Successful history read needs channel creation date and observed depth');
    const days = row.posts < 10 ? 365 : 90;
    const start = iso(Math.max(Date.parse(row.createdAt), end - days * DAY));
    result[id] = {
      start,
      live: Object.fromEntries(
        STREAMS.map(key => [key, INVENTORY.includes(key) ? iso(0) : cutoff]),
      ),
      seed: Object.fromEntries(HISTORY.map(key => [key, cutoff])),
      pages: {},
      resources: {},
      gaps: {},
    };
  }
  const probe = report.replyProbe;
  const validTs = ts => typeof ts === 'string' && /^\d{10}\.\d{6}$/.test(ts);
  const ready =
    report.rows.every(row => row.messagesRead && row.threadAccess) &&
    probe?.parentRead === true &&
    Object.hasOwn(result, probe.channel) &&
    [probe.parentTs, probe.searchAfterTs, probe.replyTs].every(validTs) &&
    probe.parentTs < probe.searchAfterTs &&
    probe.searchAfterTs < probe.replyTs &&
    Number(probe.replyTs) * 1000 <= end &&
    Number(probe.replyTs) * 1000 >= end - 90 * DAY;
  return { ready: !!ready, cutoff, channels: result, rotation: 0, receipts: {} };
}

// A task describes one stable page. Only its successful receipt changes coverage.
export function work(state, roster, run) {
  const tasks = [];
  const seedTasks = [];
  const through = state.batch?.date === run.slotDate ? state.batch.through : run.startedAt;
  const n = roster.length;
  const offset = state.batch?.date === run.slotDate ? state.batch.offset : state.rotation;
  for (let i = 0; i < n; i++) {
    const { id: channel } = roster[(offset + i) % n];
    const progress = state.channels[channel];
    for (const phase of ['live', 'seed']) {
      for (const stream of phase === 'live' ? STREAMS : HISTORY) {
        const key = phase + '-' + stream;
        const prior = progress.pages[key];
        const position = progress[phase][stream];
        if (
          phase === 'live'
            ? position >= through
            : position <= progress.start || i >= SEED_CHANNELS_PER_NIGHT
        )
          continue;
        const end = prior?.end ?? (phase === 'live' ? through : position);
        const start =
          phase === 'live'
            ? position
            : (prior?.start ??
              iso(
                Math.max(
                  Date.parse(progress.start),
                  Date.parse(end) - (prior ? LEGACY_SEED_DAYS : SEED_DAYS) * DAY,
                ),
              ));
        // At most one historical window per selected channel and stream per date.
        if (phase === 'seed' && progress.finished?.[key] === run.slotDate) continue;
        const task = { channel, phase, stream, start, end, cursor: prior?.cursor ?? null };
        task.token = sha(JSON.stringify([run.id, task]));
        if (progress.gaps[key]?.date === run.slotDate) continue;
        if (INVENTORY.includes(stream)) task.known = progress.resources[stream] ?? {};
        (phase === 'live' ? tasks : seedTasks).push(task);
      }
    }
  }
  return tasks.length ? tasks : seedTasks;
}

export function advance(state, task, page, run) {
  const p = state.channels[task.channel];
  const key = task.phase + '-' + task.stream;
  if (page.gap) {
    p.gaps[key] = { date: run.slotDate, reason: page.gap };
    if (page.gap === 'cursor-expired') delete p.pages[key];
    return;
  }
  delete p.gaps[key];
  if (INVENTORY.includes(task.stream)) {
    const current = { ...p.pages[key]?.seen, ...page.revisions };
    if (!page.next) p.resources[task.stream] = current;
    else p.pages[key] = { seen: current };
  }
  if (page.next) {
    p.pages[key] = { ...p.pages[key], cursor: page.next, start: task.start, end: task.end };
    return;
  }
  delete p.pages[key];
  p[task.phase][task.stream] = task.phase === 'live' ? task.end : task.start;
  if (task.phase === 'seed') (p.finished ??= {})[key] = run.slotDate;
}
