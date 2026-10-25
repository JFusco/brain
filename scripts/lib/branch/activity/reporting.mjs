import { randomUUID } from 'node:crypto';
import { config } from '../platform/config.mjs';
import { snapshot } from '../visual/snapshot/snapshot.mjs';
import { nodeID } from '../visual/snapshot/ids.mjs';
import { startSession, sessionInfo } from './sessions.mjs';
import { record, captureLookup, metricsWarning } from './events.mjs';

export async function reportActivity({ session, node, type, eventId, origin = 'agent' }) {
  const s = await sessionInfo(session);
  const graph = snapshot(s.snapshot);
  if (!['read', 'cited', 'complete'].includes(type))
    throw new Error('Report read, cited or complete');
  if (type === 'complete') {
    if (node) throw new Error('Completion cannot name a node');
    node = '';
  } else if (!graph.nodes.some(n => n.id === node))
    throw new Error('Activity node is outside the committed knowledge snapshot');
  return record({ session, node, type, eventId, origin });
}
// Activity names a configured domain only by its public hub node, never query or capture text.
export const domainHub = (domain, domains = config().domains) =>
  domain && domains.includes(domain) ? `knowledge/${domain}/INDEX.md` : '';
export async function recordOrdinaryLookup(result, { session } = {}) {
  try {
    const graph = snapshot();
    const ids = new Set(graph.nodes.map(n => n.id));
    const results = result.results.map(r => ({ ...r, id: nodeID(r) })).filter(r => ids.has(r.id));
    await captureLookup(results, {
      session,
      snapshot: graph.revision,
      resultCount: result.results.length,
    });
  } catch {
    metricsWarning();
  }
}
// Cross-project skills call this shared CLI; only lifecycle metadata enters activity storage.
export async function beginLookupActivity(revision, origin = 'cli', domain = '') {
  try {
    const session = (await startSession(revision || snapshot().revision)).session;
    await record({
      session,
      type: 'search-started',
      node: domainHub(domain),
      eventId: randomUUID(),
      origin,
    });
    return session;
  } catch {
    metricsWarning();
    return null;
  }
}
export async function lookupActivityFailed(session) {
  if (!session) return;
  try {
    await record({ session, type: 'search-failed', eventId: randomUUID(), origin: 'cli' });
  } catch {
    metricsWarning();
  }
}
export async function recordCaptureActivity(result) {
  if (result.status !== 'pending' || result.duplicate) return;
  try {
    const session = (await startSession(snapshot().revision)).session;
    await record({
      session,
      type: 'captured',
      node: domainHub(result.domain),
      eventId: randomUUID(),
      origin: 'cli',
    });
  } catch {
    metricsWarning();
  }
}
