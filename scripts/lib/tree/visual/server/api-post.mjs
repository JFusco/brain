import { randomUUID } from 'node:crypto';
import { reportActivity } from '../../../branch/activity/reporting.mjs';
import { sessionInfo, startSession } from '../../../branch/activity/sessions.mjs';
import { snapshot } from '../../../branch/visual/snapshot/snapshot.mjs';
import { brief } from '../brief.mjs';
import { compare } from '../compare.mjs';
import { explain } from '../explain.mjs';
import { feedback } from '../feedback.mjs';
import { playbooks } from '../playbooks.mjs';
import { route } from '../route.mjs';
import { body, strict } from './request.mjs';

// Snapshot-bound tools and the fields each accepts.
const PINNED = {
  '/api/explain': [explain, ['node', 'snapshot', 'versions']],
  '/api/compare': [compare, ['from', 'to', 'snapshot', 'versions']],
  '/api/feedback': [feedback, ['node', 'snapshot', 'value']],
};

// The selected note's body; a read is recorded only for a session on the same snapshot.
async function note(req, send) {
  const input = strict(await body(req), ['node', 'session', 'snapshot']);
  const s = snapshot();
  if (input.snapshot !== s.revision)
    return send(409, {
      error: 'Knowledge changed; refresh the graph before opening the note',
    });
  if (!s.bodies.has(input.node)) return send(404, { error: 'Unknown knowledge note' });
  let metricsRecorded = true;
  try {
    if (input.session) {
      const prior = await sessionInfo(input.session);
      if (prior.snapshot !== s.revision)
        return send(409, { error: 'Session uses an older knowledge snapshot; search again' });
      await reportActivity({
        session: input.session,
        node: input.node,
        type: 'read',
        eventId: randomUUID(),
        origin: 'viewer',
      });
    } else metricsRecorded = false;
  } catch {
    metricsRecorded = false;
  }
  return send(200, {
    snapshot: s.revision,
    node: input.node,
    body: s.bodies.get(input.node),
    metricsRecorded,
  });
}

// Write API routes: same-origin JSON only. Returns true when the request was handled.
export async function postApi(req, url, origin, send) {
  if (req.method !== 'POST') return false;
  if (req.headers.origin !== origin) send(403, { error: 'Same-origin request required' });
  else if (!String(req.headers['content-type']).startsWith('application/json'))
    send(415, { error: 'JSON required' });
  else if (url.pathname === '/api/session') {
    strict(await body(req), []);
    send(200, await startSession(snapshot().revision));
  } else if (url.pathname === '/api/route') {
    const input = strict(await body(req), ['query', 'domain', 'versions']);
    send(200, await route({ ...input, origin: 'viewer' }));
  } else if (url.pathname === '/api/brief') {
    const input = strict(await body(req), ['query', 'domain', 'versions']);
    send(200, await brief({ ...input, origin: 'viewer' }));
  } else if (url.pathname === '/api/playbooks') {
    const input = strict(await body(req), ['domain', 'versions']);
    send(200, playbooks(input));
  } else if (Object.hasOwn(PINNED, url.pathname)) {
    const [tool, fields] = PINNED[url.pathname];
    const input = strict(await body(req), fields);
    if (input.snapshot !== snapshot().revision)
      send(409, { error: 'Knowledge changed; refresh before continuing' });
    else send(200, await tool(input));
  } else if (url.pathname === '/api/note') await note(req, send);
  else return false;
  return true;
}
