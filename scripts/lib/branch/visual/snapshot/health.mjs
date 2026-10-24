import { readJSON } from '../../../leaf/json.mjs';
import { sha } from '../../../leaf/hash.mjs';
import { at } from '../../../leaf/paths.mjs';

export function healthOverlay(graph) {
  const links = readJSON(at('.state/link-health.json'), { links: {} }).links;
  return graph.nodes.map(n => {
    const state = n.url ? links[sha(n.url)] : null;
    return {
      ...n,
      ...(state ? { linkHealth: { state: state.state, checkedAt: state.checkedAt } } : {}),
    };
  });
}
