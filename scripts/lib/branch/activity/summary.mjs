import { DAY } from '../../leaf/time.mjs';
import { database, day } from './database.mjs';

export async function summary(period = 'today') {
  if (!['today', 'week', 'all'].includes(period)) throw new Error('Unknown metrics period');
  const db = await database(),
    since =
      period === 'today'
        ? day(Date.now())
        : period === 'week'
          ? new Date(Date.parse(day(Date.now()) + 'T12:00:00Z') - 6 * DAY)
              .toISOString()
              .slice(0, 10)
          : '0000-00-00';
  const rows = db
    .prepare(
      'SELECT node,type,SUM(count) AS count,MAX(last) AS last FROM daily WHERE day>=? GROUP BY node,type',
    )
    .all(since);
  const totals = { search: 0, 'no-results': 0, returned: 0, read: 0, cited: 0, captured: 0 },
    nodes = {};
  for (const row of rows) {
    totals[row.type] = (totals[row.type] || 0) + row.count;
    if (row.node) {
      nodes[row.node] ??= { returned: 0, read: 0, cited: 0, lastUsed: 0 };
      nodes[row.node][row.type] = row.count;
      nodes[row.node].lastUsed = Math.max(nodes[row.node].lastUsed, row.last);
    }
  }
  const sessions = db
    .prepare('SELECT id,snapshot,started,completed FROM sessions ORDER BY started DESC LIMIT 20')
    .all()
    .map(s => ({
      ...s,
      status: s.completed ? 'completed' : Date.now() - s.started > DAY ? 'interrupted' : 'active',
    }));
  const recent = db
    .prepare(
      'SELECT e.session,e.node,e.type,e.at,e.origin,s.snapshot FROM events e JOIN sessions s ON s.id=e.session ORDER BY e.seq DESC LIMIT 20',
    )
    .all();
  return {
    recent,
    period,
    timezone: 'America/New_York',
    totals,
    nodes,
    sessions,
    firstRecorded: db.prepare('SELECT MIN(day) AS day FROM daily').get().day,
  };
}
