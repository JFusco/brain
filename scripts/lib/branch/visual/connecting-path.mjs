import { versionFit } from '../project/versions.mjs';

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
