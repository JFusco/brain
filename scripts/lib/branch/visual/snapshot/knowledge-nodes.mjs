import { sha } from '../../../leaf/hash.mjs';
import { splitFrontmatter, scalar, list } from '../../../leaf/frontmatter.mjs';
import { validateKnowledge } from '../../guidance/knowledge.mjs';
import { guidanceState } from '../../guidance/freshness.mjs';

// Published notes and hubs; invalid, retired and superseded notes stay out of the graph.
export function addKnowledge(graph, contents, lock) {
  const { entries, bodies, addNode } = graph;
  for (const [id, bytes] of contents) {
    if (!id.startsWith('knowledge/') || id.includes('/_templates/')) continue;
    const parsed = splitFrontmatter(bytes.toString()),
      index = id.endsWith('/INDEX.md');
    if (
      !index &&
      (validateKnowledge([{ id, bytes }]).length ||
        ['retired', 'superseded'].includes(scalar(parsed.raw, 'status')))
    )
      continue;
    const domain = index
      ? id === 'knowledge/INDEX.md'
        ? null
        : id.slice(10, -9)
      : scalar(parsed.raw, 'domain');
    const freshness = index ? { status: 'current' } : guidanceState(parsed.raw, lock);
    const title = scalar(parsed.raw, 'title') || id;
    const n = {
      id,
      title,
      kind: index ? 'index' : 'curated-note',
      format: scalar(parsed.raw, 'format') || 'note',
      domain,
      domains: domain ? [domain] : [],
      bytes: bytes.length,
      versions: list(parsed.raw, 'versions'),
      freshness,
      sha256: sha(bytes),
      path: id,
      summary: parsed.body
        .replace(/^#+.*$/gm, '')
        .trim()
        .slice(0, 500),
      applicability: scalar(parsed.raw, 'applicability'),
    };
    addNode(n);
    bodies.set(id, parsed.body);
    if (!index) entries.push(n);
  }
}
