// Pure derivations from a committed graph snapshot and its activity metrics.

export const endpoint = end => end.id || end;

export function edgeKey(edge) {
  return `${endpoint(edge.source)}|${endpoint(edge.target)}|${edge.relation}`;
}

// A note whose sources changed, or a reference whose last link check failed.
export function needsAttention(n) {
  return (
    n?.freshness?.status === 'needs-revalidation' ||
    (!!n?.linkHealth && !['healthy', 'redirected'].includes(n.linkHealth.state))
  );
}

// The first `limit` distinct neighbors of a node; `total` counts all its relationships.
export function neighborhood(edges, id, limit) {
  const relationships = edges.filter(edge => edge.source === id || edge.target === id),
    neighbors = [
      ...new Set(relationships.map(edge => (edge.source === id ? edge.target : edge.source))),
    ].slice(0, limit);
  return { id, neighbors, ids: new Set([id, ...neighbors]), total: relationships.length };
}

// References shown in the overview: up to six pages per source plus every cited reference.
export function overviewReferences(graph) {
  const references = new Set();
  for (const source of graph.nodes.filter(n => n.kind === 'source'))
    graph.nodes
      .filter(n => n.source === source.id.slice(7))
      .slice(0, 6)
      .forEach(n => references.add(n.id));
  for (const edge of graph.edges)
    if (edge.relation === 'cites official reference') references.add(edge.target);
  return references;
}

export function domainCoverage(graph, stats) {
  return graph.domains.map(domain => {
    const items = graph.nodes.filter(n => n.domain === domain || n.domains?.includes(domain));
    return {
      domain,
      notes: items.filter(n => n.kind === 'curated-note').length,
      refs: items.filter(n => n.url).length,
      usage: items.reduce((sum, n) => sum + (stats?.nodes[n.id]?.returned || 0), 0),
    };
  });
}

export function usageText(counts) {
  return `Returned ${counts?.returned || 0} · Read ${counts?.read || 0} · Cited ${counts?.cited || 0}${counts?.lastUsed ? ' · Last used ' + new Date(counts.lastUsed).toLocaleString() : ''}`;
}

export function activityText(event, nodes) {
  if (event.type === 'captured') return 'Capture received · pending curation';
  if (event.type === 'search-started') return 'Lookup started';
  if (event.type === 'search-failed') return 'Lookup unavailable';
  if (event.type === 'complete') return 'Reading session complete';
  const node = nodes.find(node => node.id === event.node);
  return `${event.origin === 'agent' ? 'Agent-reported ' : ''}${event.type} · ${node?.title || 'knowledge lookup'}`;
}
