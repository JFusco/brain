import { snapshot as readSnapshot } from '../../branch/visual/snapshot/snapshot.mjs';
import { projectContext } from '../../branch/project/context.mjs';
import { describe } from '../../branch/visual/guidance-graph.mjs';
import { route } from './route.mjs';

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
