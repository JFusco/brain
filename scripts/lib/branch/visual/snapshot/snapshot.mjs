import { parseJSON } from '../../../leaf/json.mjs';
import { committedBlobs, mainRevision } from './blobs.mjs';
import { addCatalogs, addPointers } from './catalog-nodes.mjs';
import { createGraph } from './graph.mjs';
import { addKnowledge } from './knowledge-nodes.mjs';
import { addLinks } from './links.mjs';

let cached;
// The knowledge graph of one committed main revision, cached per process.
export function snapshot(revision = mainRevision()) {
  if (cached?.revision === revision) return cached;
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Invalid knowledge snapshot');
  const contents = committedBlobs(revision);
  const json = name => parseJSON(contents.get(name)?.toString() || 'null');
  const config = json('brain.config.json'),
    registry = json('official/sources.json'),
    lock = json('official/sources.lock.json');
  if (!config || !registry || !lock) throw new Error('Committed knowledge metadata is missing');
  const graph = createGraph();
  addKnowledge(graph, contents, lock);
  addCatalogs(graph, contents, registry, lock);
  addPointers(graph, registry);
  addLinks(graph);
  const { nodes, edges, entries, bodies } = graph;
  cached = {
    revision,
    nodes: [...nodes.values()],
    edges,
    entries,
    bodies,
    domains: config.domains,
  };
  return cached;
}
