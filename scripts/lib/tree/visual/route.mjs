import { randomUUID } from 'node:crypto';
import { at } from '../../leaf/paths.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { rankEntries } from '../../branch/search/rank.mjs';
import { installedEntries } from '../../branch/lookup/sources.mjs';
import { tokens } from '../../branch/search/tokens.mjs';
import { projectContext } from '../../branch/project/context.mjs';
import { snapshot } from '../../branch/visual/snapshot/snapshot.mjs';
import { nodeID } from '../../branch/visual/snapshot/ids.mjs';
import { sessionInfo } from '../../branch/activity/sessions.mjs';
import { record, captureLookup, metricsWarning } from '../../branch/activity/events.mjs';
import { connectingPath } from '../../branch/visual/connecting-path.mjs';
import { beginLookupActivity } from '../../branch/activity/reporting.mjs';

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
