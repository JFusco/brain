import { snapshot } from '../../../branch/visual/snapshot/snapshot.mjs';
import { healthOverlay } from '../../../branch/visual/snapshot/health.mjs';
import { pendingIntake } from '../../../branch/visual/intake.mjs';
import { eventsAfter, latestSequence } from '../../../branch/activity/events.mjs';
import { summary } from '../../../branch/activity/summary.mjs';

const POLL_MS = 750;

// Live activity as server-sent events, polled from the activity store.
async function events(req, res) {
  let seq = await latestSequence();
  res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
  res.write('event: ready\ndata: {}\n\n');
  let busy = false;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      const rows = await eventsAfter(seq);
      if (rows.length) {
        seq = rows.at(-1).seq;
        res.write(`data: ${JSON.stringify(rows)}\n\n`);
      } else res.write(': heartbeat\n\n');
    } catch {
      res.write('event: unavailable\ndata: {}\n\n');
    } finally {
      busy = false;
    }
  }, POLL_MS);
  req.on('close', () => clearInterval(timer));
}

// Read-only API routes. Returns true when the request was handled.
export async function getApi(req, res, url, send) {
  if (req.method !== 'GET') return false;
  if (url.pathname === '/api/graph') {
    const s = snapshot(),
      nodes = healthOverlay(s);
    send(200, { snapshot: s.revision, domains: s.domains, nodes, edges: s.edges });
  } else if (url.pathname === '/api/intake') send(200, pendingIntake());
  else if (url.pathname === '/api/metrics')
    send(200, await summary(url.searchParams.get('period') || 'today'));
  else if (url.pathname === '/api/events') await events(req, res);
  else return false;
  return true;
}
