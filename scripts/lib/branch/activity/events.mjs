import { randomUUID } from 'node:crypto';
import { DAY } from '../../leaf/time.mjs';
import { database, day } from './database.mjs';
import { startSession, sessionInfo } from './sessions.mjs';

export async function record({ session, node = '', type, eventId, origin = 'agent' }) {
  const db = await database();
  await sessionInfo(session);
  const now = Date.now();
  if (
    ![
      'search-started',
      'search-failed',
      'captured',
      'search',
      'no-results',
      'returned',
      'planned',
      'read',
      'cited',
      'complete',
    ].includes(type) ||
    !['agent', 'viewer', 'cli'].includes(origin)
  )
    throw new Error('Invalid activity event');
  if (
    typeof eventId !== 'string' ||
    !/^[-a-f0-9]{36}$/.test(eventId) ||
    typeof node !== 'string' ||
    node.length > 2048
  )
    throw new Error('Invalid activity identifiers');
  const dedupe = ['read', 'cited', 'complete'].includes(type)
    ? `${session}|${node}|${type}`
    : eventId;
  db.exec('BEGIN IMMEDIATE');
  try {
    const prior = db
      .prepare('SELECT id,dedupe FROM events WHERE id=? OR dedupe=?')
      .get(eventId, dedupe);
    if (prior) {
      db.exec('COMMIT');
      return { recorded: false, duplicate: true };
    }
    const current = db.prepare('SELECT started,completed FROM sessions WHERE id=?').get(session);
    if (now - current.started > DAY || current.completed)
      throw new Error('Activity session has expired or completed');
    db.prepare(
      'INSERT INTO events(id,dedupe,session,node,type,at,origin) VALUES(?,?,?,?,?,?,?)',
    ).run(eventId, dedupe, session, node, type, now, origin);
    if (!['planned', 'complete', 'search-started', 'search-failed'].includes(type))
      db.prepare(
        `INSERT INTO daily(day,node,type,count,last) VALUES(?,?,?,1,?) ON CONFLICT(day,node,type) DO UPDATE SET count=count+1,last=excluded.last`,
      ).run(day(now), node, type, now);
    if (type === 'complete')
      db.prepare('UPDATE sessions SET completed=? WHERE id=?').run(now, session);
    // Daily totals are updated in the same transaction as insertion, before pruning.
    db.prepare('DELETE FROM events WHERE at < ?').run(now - 30 * DAY);
    db.prepare(
      'DELETE FROM sessions WHERE started < ? AND id NOT IN (SELECT session FROM events)',
    ).run(now - 30 * DAY);
    db.exec('COMMIT');
    return { recorded: true, eventId };
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
export async function eventsAfter(seq = 0) {
  const db = await database();
  return db
    .prepare(
      'SELECT e.seq,e.session,e.node,e.type,e.at,e.origin,s.snapshot FROM events e JOIN sessions s ON s.id=e.session WHERE e.seq>? ORDER BY e.seq LIMIT 500',
    )
    .all(seq);
}
export async function latestSequence() {
  return (await database()).prepare('SELECT COALESCE(MAX(seq),0) AS seq FROM events').get().seq;
}
export async function captureLookup(
  results,
  { session, snapshot, origin = 'cli', resultCount = results.length } = {},
) {
  const id = session || (await startSession(snapshot)).session;
  const lookupId = randomUUID();
  await record({ session: id, type: 'search', eventId: lookupId, origin });
  if (!resultCount)
    await record({ session: id, type: 'no-results', eventId: randomUUID(), origin });
  const nodes = [...new Set(results.map(r => r.id).filter(Boolean))];
  for (const node of nodes)
    await record({ session: id, type: 'returned', node, eventId: randomUUID(), origin });
  for (let i = 0; i < resultCount - nodes.length; i++)
    await record({ session: id, type: 'returned', eventId: randomUUID(), origin });
  return id;
}
export function metricsWarning() {
  console.error(
    'brain: activity metrics were not recorded; retrieval remains available. Check local activity storage.',
  );
}
