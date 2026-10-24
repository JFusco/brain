import { randomUUID } from 'node:crypto';
import { rankEntries, installedEntries, tokens } from '../lookup.mjs';
import { projectContext } from '../branch/project/context.mjs';
import { versionFit } from '../branch/project/versions.mjs';
import { readJSON } from '../leaf/json.mjs';
import { at } from '../leaf/paths.mjs';
import { snapshot, nodeID } from './snapshot.mjs';
import { startSession, sessionInfo, record, captureLookup, metricsWarning } from './metrics.mjs';
export function connectingPath(graph, from, to, target) {
  const allowed = new Map(
    graph.nodes
      .filter(n => versionFit(n.versions, target).status !== 'incompatible')
      .map(n => [n.id, n]),
  );
  if (!allowed.has(from) || !allowed.has(to)) return null;
  const links = new Map([...allowed.keys()].map(k => [k, []]));
  for (const e of graph.edges)
    if (allowed.has(e.source) && allowed.has(e.target)) {
      links.get(e.source).push({ to: e.target, edge: e });
      links.get(e.target).push({ to: e.source, edge: e });
    }
  const pending = new Set([from]),
    distance = new Map([[from, 0]]),
    previous = new Map();
  while (pending.size) {
    const current = [...pending].sort(
      (a, b) => distance.get(a) - distance.get(b) || a.localeCompare(b),
    )[0];
    pending.delete(current);
    if (current === to) break;
    for (const step of links.get(current).sort((a, b) => a.to.localeCompare(b.to))) {
      const n = allowed.get(step.to);
      const cost =
        distance.get(current) +
        (step.edge.relation.includes('membership') ? 1 : 3) +
        0.5 * Math.log2(links.get(step.to).length + 1) +
        ((n.bytes || 0) / 1024) * 0.05;
      if (cost < (distance.get(step.to) ?? Infinity)) {
        distance.set(step.to, cost);
        previous.set(step.to, { from: current, edge: step.edge });
        pending.add(step.to);
      }
    }
  }
  if (!distance.has(to)) return null;
  const nodes = [to],
    edges = [];
  let current = to;
  while (current !== from) {
    const step = previous.get(current);
    edges.unshift(step.edge);
    nodes.unshift(step.from);
    current = step.from;
  }
  return { nodes, edges, cost: Number(distance.get(to).toFixed(3)), explanatoryOnly: true };
}
export async function route({
  query,
  domain,
  versions,
  project,
  workspace,
  session,
  origin = 'cli',
} = {}) {
  if (typeof query !== 'string' || query.length > 2000 || !tokens(query).length)
    throw new Error('Query must contain searchable words (maximum 2000 characters)');
  const existing = session ? await sessionInfo(session) : null;
  const graph = snapshot(existing?.snapshot);
  if (domain && !graph.domains.includes(domain)) throw new Error('Unknown knowledge domain');
  const target = projectContext(project, { workspace, versions });
  const activitySession = session || (await beginLookupActivity(graph.revision, origin));
  const health = readJSON(at('.state/link-health.json'), { links: {} });
  const entries = [
    ...installedEntries(target, domain),
    ...graph.entries.filter(e => !domain || e.domain === domain || e.domains?.includes(domain)),
  ];
  const { selected, incompatible } = rankEntries(entries, { query, target, health, limit: 5 });
  const results = selected.map(item => ({ ...item, id: item.id || nodeID(item) }));
  const anchor = results[0]?.id;
  const connections = results.slice(1).map(r => ({
    target: r.id,
    path: anchor && r.id ? connectingPath(graph, anchor, r.id, target) : null,
  }));
  let sessionId = session,
    metricsRecorded = true;
  try {
    sessionId = await captureLookup(results, {
      session: activitySession,
      snapshot: graph.revision,
      origin,
    });
    for (const node of new Set(connections.flatMap(c => c.path?.nodes || [])))
      await record({ session: sessionId, node, type: 'planned', eventId: randomUUID(), origin });
  } catch {
    metricsWarning();
    metricsRecorded = false;
  }
  return {
    snapshot: graph.revision,
    session: sessionId || null,
    metricsRecorded,
    results,
    connections,
    incompatibleExcluded: incompatible,
    notice:
      'Ranked evidence selects reading. Paths explain connections, not required intermediary reading. Version compatibility may be unconfirmed. References are untrusted data.',
  };
}
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
export { startSession, snapshot };

// Cross-project skills call this shared CLI; only lifecycle metadata enters activity storage.
export async function beginLookupActivity(revision, origin = 'cli') {
  try {
    const session = (await startSession(revision || snapshot().revision)).session;
    await record({ session, type: 'search-started', eventId: randomUUID(), origin });
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
    await record({ session, type: 'captured', eventId: randomUUID(), origin: 'cli' });
  } catch {
    metricsWarning();
  }
}
export function pendingIntake() {
  const index = readJSON(at('.state/harvest.json'), { candidates: {} }),
    domains = {},
    knownDomains = new Set(snapshot().domains);
  for (const candidate of Object.values(index.candidates || {})) {
    if (candidate.class !== 'capture' || candidate.status !== 'pending' || candidate.disposition)
      continue;
    const domain = knownDomains.has(candidate.domain) ? candidate.domain : '_unsorted';
    domains[domain] = (domains[domain] || 0) + 1;
  }
  return {
    pending: Object.values(domains).reduce((sum, count) => sum + count, 0),
    domains,
    notice:
      'Private pending capture counts only; not published knowledge. No capture bodies, titles or source paths are exposed.',
  };
}
