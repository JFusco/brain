import { projectContext } from '../../branch/project/context.mjs';
import {
  current,
  nodeOf,
  describe,
  reason,
  priority,
} from '../../branch/visual/guidance-graph.mjs';

export function explain({ node, snapshot, versions, project, workspace } = {}) {
  const graph = current(snapshot),
    target = projectContext(project, { workspace, versions }),
    selected = nodeOf(graph, node);
  const edges = graph.edges
    .filter(e => e.source === node || e.target === node)
    .sort(
      (a, b) => priority(a.relation) - priority(b.relation) || a.target.localeCompare(b.target),
    );
  const relationshipKeys = new Set();
  const unique = edges.filter(e => {
    const key = (e.source === node ? e.target : e.source) + '|' + e.relation;
    if (relationshipKeys.has(key)) return false;
    relationshipKeys.add(key);
    return true;
  });
  const connections = unique.slice(0, 24).map(e => {
    const other = nodeOf(graph, e.source === node ? e.target : e.source);
    return {
      node: describe(graph, other, target),
      relation: e.relation,
      explanation: reason[e.relation] || 'An explicit authored relationship connects these pages.',
    };
  });
  const seen = new Set();
  const nextReading = connections
    .filter(
      c =>
        c.node.compatibility.status !== 'incompatible' &&
        !seen.has(c.node.id) &&
        seen.add(c.node.id),
    )
    .slice(0, 5);
  return {
    snapshot: graph.revision,
    node: describe(graph, selected, target),
    connections,
    totalConnections: unique.length,
    nextReading,
    notice:
      'Connections explain explicit links, not agreement or technical correctness. Suggested reading does not change search ranking. Unknown applicability remains unknown.',
  };
}
