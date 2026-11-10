import { projectContext } from '../project/context.mjs';
import { rankEntries } from '../search/rank.mjs';
import { publishedSnapshot } from './published-read.mjs';
export function publishedSearch({ snapshot: revision, query, limit = 5, kind, versions }, load) {
  if (
    !revision ||
    typeof query !== 'string' ||
    !query.trim() ||
    query.length > 2000 ||
    kind !== 'note'
  )
    throw new Error('Use a committed snapshot, bounded query and --kind note');
  if (versions !== undefined && (typeof versions !== 'string' || versions.length > 2000))
    throw new Error('Version context must be at most 2,000 characters');
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 20)
    throw new Error('Search limit must be 1 through 20');
  const graph = publishedSnapshot(revision, load);
  const entries = graph.entries
    .filter(n => n.kind === 'curated-note')
    .sort((a, b) => a.id.localeCompare(b.id));
  // Explicit versions only; projectContext reads no project files without a path.
  const { selected, incompatible } = rankEntries(entries, {
    query,
    limit,
    target: projectContext(undefined, { versions }),
  });
  const results = selected.map(n => ({
    ...n,
    contentSha256: n.sha256,
    citations: graph.edges
      .filter(e => e.source === n.id)
      .map(e => ({ ...e, url: graph.nodes.find(node => node.id === e.target)?.url || null })),
    limitations:
      n.freshness?.status === 'needs-revalidation' ? ['Published guidance needs revalidation'] : [],
  }));
  const response = { version: 1, snapshot: graph.revision, results, incompatible };
  // Measure the bytes brain.mjs emits: JSON.stringify(result, null, 2) plus a newline.
  if (Buffer.byteLength(JSON.stringify(response, null, 2) + '\n') > 512 * 1024)
    throw new Error('Search response exceeds its bound');
  return response;
}
