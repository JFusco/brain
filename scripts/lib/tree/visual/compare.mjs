import { projectContext } from '../../branch/project/context.mjs';
import { current, nodeOf, describe } from '../../branch/visual/guidance-graph.mjs';

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
