import { projectContext } from '../../branch/project/context.mjs';
import { versionFit } from '../../branch/project/versions.mjs';
import { snapshot as readSnapshot } from '../../branch/visual/snapshot/snapshot.mjs';
import { describe } from '../../branch/visual/guidance-graph.mjs';

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
