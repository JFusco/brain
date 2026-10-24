import { $ } from '../lib/dom.js';
import { edgeKey } from '../lib/knowledge.js';
import { reduced, state } from '../model/state.js';
import { energized } from './colors.js';

const LABELS = {
  searching: () => 'Searching knowledge',
  found: result => `${result.results.length} sources found`,
  captured: () => 'Capture received · pending curation',
  external: () => 'Lookup complete · external references',
  empty: () => 'No matching sources',
  error: () => 'Lookup unavailable',
};

// Switches the search animation stage; a found result energizes its nodes and path edges.
export function searchVisual(stage, result) {
  clearTimeout(state.externalSearchTimer);
  state.searchStage = stage;
  state.searchFound.clear();
  state.searchEdges.clear();
  state.searchUntil = stage === 'searching' ? Infinity : Date.now() + 4500;
  $('search-state').hidden = stage === 'idle';
  $('search-state').textContent = LABELS[stage]?.(result) ?? '';
  if (stage === 'found') {
    for (const item of result.results) if (item.id) state.searchFound.add(item.id);
    for (const connection of result.connections) {
      for (const id of connection.path?.nodes || []) state.searchFound.add(id);
      for (const edge of connection.path?.edges || []) state.searchEdges.add(edgeKey(edge));
    }
    if (state.network && !reduced.matches)
      for (const edge of state.network.graphData().links)
        if (energized(edge)) for (let i = 0; i < 4; i++) state.network.emitParticle(edge);
  }
}
