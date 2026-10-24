import { sha } from '../../../leaf/hash.mjs';
import { parseJSON } from '../../../leaf/json.mjs';
import { https, nodeID } from './ids.mjs';

// Registered sources with their catalog entries, verified against the committed lock.
export function addCatalogs(graph, contents, registry, lock) {
  const { entries, addNode, edge } = graph;
  for (const spec of registry.sources) {
    const active = lock.sources[spec.id];
    const bytes = contents.get(`official/catalogs/${spec.id}.json`);
    if (!active || !bytes) continue;
    if (sha(bytes) !== active.catalogSha256)
      throw new Error('Committed catalog does not match its lock');
    const doc = parseJSON(bytes);
    if (doc.source !== spec.id || doc.revision !== active.revision)
      throw new Error('Invalid committed catalog');
    const source = `source:${spec.id}`;
    addNode({
      id: source,
      title: spec.id,
      kind: 'source',
      domains: spec.domains,
      bytes: 0,
      versions: [],
      freshness: { status: 'unknown' },
      sourceRevision: active.revision,
      catalogFetchedAt: active.fetchedAt,
      applicability: spec.applicability,
    });
    for (const [items, kind] of [
      [doc.pages, 'official-page'],
      [doc.skills, 'skill-reference'],
      [doc.docs, 'official-reference'],
    ])
      for (const item of items || []) {
        const url = https(item.url);
        if (!url) continue;
        const entry = {
          ...item,
          url,
          title: item.declaredName || item.title || item.name || url,
          summary: item.description || item.summary,
          kind,
          source: spec.id,
          domains: spec.domains,
          sourceRevision: active.revision,
          catalogFetchedAt: active.fetchedAt,
          sourceApplicability: spec.applicability,
        };
        if (kind === 'skill-reference') entry.applicability = item.appliesTo;
        entry.id = nodeID(entry);
        addNode({
          ...entry,
          bytes: 0,
          versions: entry.versions || [],
          freshness: { status: 'unknown' },
        });
        entries.push(entry);
        edge(source, entry.id, 'catalog membership');
      }
    for (const domain of spec.domains)
      edge(`knowledge/${domain}/INDEX.md`, source, 'registered source');
  }
}

export function addPointers(graph, registry) {
  const { entries, addNode, edge } = graph;
  for (const pointer of registry.pointers || []) {
    const url = https(pointer.url);
    if (!url) continue;
    const entry = {
      id: `url:${sha(url)}`,
      kind: 'official-pointer',
      title: pointer.domain + ' official documentation',
      domains: [pointer.domain],
      url,
      summary: pointer.reason,
      bytes: 0,
      versions: [],
      freshness: { status: 'unknown' },
    };
    addNode(entry);
    entries.push(entry);
    edge(`knowledge/${pointer.domain}/INDEX.md`, entry.id, 'official pointer');
  }
}
