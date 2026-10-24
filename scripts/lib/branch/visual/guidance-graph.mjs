import { snapshot as readSnapshot } from './snapshot/snapshot.mjs';
import { versionFit } from '../project/versions.mjs';

export function current(revision) {
  const graph = readSnapshot();
  if (revision !== undefined && revision !== graph.revision)
    throw new Error('Knowledge changed; refresh before continuing');
  return graph;
}
export function nodeOf(graph, id) {
  const node = graph.nodes.find(n => n.id === id);
  if (!node) throw new Error('Unknown committed knowledge node');
  return node;
}
export function section(body, title) {
  const lines = (body || '').replace(/```[\s\S]*?```/g, '').split('\n');
  const start = lines.findIndex(line => line.trim().toLowerCase() === '## ' + title.toLowerCase());
  if (start < 0) return '';
  const end = lines.findIndex((line, i) => i > start && /^##\s/.test(line));
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join('\n')
    .trim()
    .slice(0, 4000);
}
export function describe(graph, node, target) {
  const body = graph.bodies.get(node.id);
  return {
    id: node.id,
    title: node.title,
    kind: node.kind,
    format: node.format,
    url: node.url,
    path: node.path,
    domains: node.domains,
    versions: node.versions || [],
    compatibility: versionFit(node.versions, target),
    applicability:
      node.applicability ||
      node.sourceApplicability ||
      'Applicability has not been documented; confirm the task, product surface and version.',
    freshness: node.freshness,
    sourceRevision: node.sourceRevision,
    whenToUse: section(body, 'When to use this'),
    procedure: section(body, 'What to do'),
    guidanceBoundaries: section(body, 'Where guidance differs'),
    evidenceAndLimits: section(body, 'Evidence and limits'),
  };
}
export const reason = {
  'domain membership': 'This note belongs to the named domain hub.',
  'catalog membership': 'This reference is listed in the registered source catalog.',
  'registered source': 'This domain hub explicitly registers this official source.',
  'official pointer':
    'This hub links to the official website; its contents are not catalogued by that pointer.',
  'cites official reference': 'This knowledge page explicitly cites the official reference.',
  'links to': 'One knowledge page explicitly links to the other.',
};
export const priority = relation =>
  relation === 'cites official reference'
    ? 0
    : relation === 'links to'
      ? 1
      : relation.includes('membership')
        ? 3
        : 2;
