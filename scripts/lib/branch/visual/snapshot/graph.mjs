// Graph state shared by the snapshot passes. Node insertion and edge order are part of the output.
export function createGraph() {
  const nodes = new Map(),
    entries = [],
    bodies = new Map(),
    edges = [],
    edgeKeys = new Set();
  function addNode(n) {
    const prior = nodes.get(n.id);
    if (prior) {
      prior.domains = [...new Set([...prior.domains, ...n.domains])];
      return prior;
    }
    nodes.set(n.id, n);
    return n;
  }
  function edge(source, target, relation) {
    if (source === target || !nodes.has(source) || !nodes.has(target)) return;
    const key = `${source}|${target}|${relation}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, relation });
  }
  return { nodes, entries, bodies, edges, addNode, edge };
}
