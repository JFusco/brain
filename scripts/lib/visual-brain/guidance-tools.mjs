import { snapshot as readSnapshot } from './snapshot.mjs';
import { route } from './retrieval.mjs';
import { projectContext, versionFit } from '../project-context.mjs';

function current(revision) {
  const graph = readSnapshot();
  if (revision !== undefined && revision !== graph.revision)
    throw new Error('Knowledge changed; refresh before continuing');
  return graph;
}
function nodeOf(graph, id) {
  const node = graph.nodes.find(n => n.id === id);
  if (!node) throw new Error('Unknown committed knowledge node');
  return node;
}
function section(body, title) {
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
function describe(graph, node, target) {
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
const reason = {
  'domain membership': 'This note belongs to the named domain hub.',
  'catalog membership': 'This reference is listed in the registered source catalog.',
  'registered source': 'This domain hub explicitly registers this official source.',
  'official pointer':
    'This hub links to the official website; its contents are not catalogued by that pointer.',
  'cites official reference': 'This knowledge page explicitly cites the official reference.',
  'links to': 'One knowledge page explicitly links to the other.',
};
const priority = relation =>
  relation === 'cites official reference'
    ? 0
    : relation === 'links to'
      ? 1
      : relation.includes('membership')
        ? 3
        : 2;
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
export function compare({ from, to, snapshot, versions, project, workspace } = {}) {
  if (from === to) throw new Error('Choose two different knowledge nodes');
  const graph = current(snapshot),
    target = projectContext(project, { workspace, versions });
  const left = describe(graph, nodeOf(graph, from), target),
    right = describe(graph, nodeOf(graph, to), target);
  const differences = [];
  if (JSON.stringify(left.versions) !== JSON.stringify(right.versions))
    differences.push(
      'The package-version constraints differ. Apply only the constraints matching the selected application.',
    );
  if (JSON.stringify(left.applicability) !== JSON.stringify(right.applicability))
    differences.push(
      'The documented applicability differs. Check product surface, task conditions and limits before choosing guidance.',
    );
  if (
    left.freshness?.status === 'needs-revalidation' ||
    right.freshness?.status === 'needs-revalidation'
  )
    differences.push('At least one note needs source or claim revalidation.');
  if (left.compatibility.status === 'incompatible' || right.compatibility.status === 'incompatible')
    differences.push('At least one source is incompatible with the supplied package versions.');
  return {
    snapshot: graph.revision,
    left,
    right,
    differences,
    relationships: graph.edges.filter(
      e => (e.source === from && e.target === to) || (e.source === to && e.target === from),
    ),
    verdict: 'unresolved',
    notice:
      'This comparison exposes scope and authored decision branches. It does not infer semantic agreement or contradiction. Read both sources; unresolved claims require evidence or a project decision.',
  };
}
export function playbooks({ domain, versions, project, workspace } = {}) {
  const graph = readSnapshot();
  if (domain && !graph.domains.includes(domain)) throw new Error('Unknown knowledge domain');
  const target = projectContext(project, { workspace, versions });
  return {
    snapshot: graph.revision,
    playbooks: graph.nodes
      .filter(
        n =>
          n.kind === 'curated-note' &&
          n.format === 'playbook' &&
          (!domain || n.domain === domain) &&
          versionFit(n.versions, target).status !== 'incompatible',
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(n => describe(graph, n, target)),
    notice:
      'Playbooks are proposed workflows supported by cited documentation. Confirm applicability and the consuming project instructions before acting.',
  };
}
export async function brief(options = {}) {
  const result = await route(options),
    graph = readSnapshot(result.snapshot),
    context = projectContext(options.project, {
      workspace: options.workspace,
      versions: options.versions,
    });
  const evidence = result.results.map(item => {
    const node = graph.nodes.find(n => n.id === item.id);
    return node
      ? describe(graph, node, context)
      : {
          ...item,
          applicability:
            item.applicability || 'Installed documentation; confirm the selected application.',
        };
  });
  const gaps = [];
  if (context.workspaceSelectionRequired)
    gaps.push('Select one application workspace before giving project-specific recommendations.');
  if (!Object.keys(context.dependencies).length)
    gaps.push('No application package versions were supplied or detected.');
  if (!evidence.length)
    gaps.push('No matching evidence was found; do not invent a recommendation.');
  if (evidence.some(e => e.compatibility?.status === 'unconfirmed'))
    gaps.push('Some sources have unconfirmed package-version applicability.');
  if (evidence.some(e => e.freshness?.status === 'needs-revalidation'))
    gaps.push('Some guidance needs claim revalidation before use.');
  return {
    ...result,
    task: options.query,
    context,
    evidence,
    gaps,
    nextSteps: [
      'Read the applicable ranked evidence and its limits.',
      'Explain task-specific pitfalls and any differing guidance with citations.',
      'Propose the smallest implementation and verification steps allowed by the project.',
    ],
    notice:
      'This is an evidence briefing, not an implementation or technical acceptance. The CLI performs no model inference, project edits or automatic capture. The agent turns the retrieved evidence into the task-specific briefing.',
  };
}
