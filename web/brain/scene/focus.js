import { $ } from '../lib/dom.js';
import { neighborhood } from '../lib/knowledge.js';
import { reduced, state } from '../model/state.js';
import { rebuild, resizeScene } from './network.js';

// Shows one node with up to `limit` connected stars around it.
export function focusNode(id, limit = 24) {
  const { graph } = state;
  state.focusGraph = neighborhood(graph.edges, id, limit);
  const { neighbors, total } = state.focusGraph;
  document.body.classList.add('node-focused');
  $('overview').hidden = false;
  $('focus-title').textContent = graph.nodes.find(node => node.id === id)?.title || '';
  $('focus-count').textContent =
    `${neighbors.length} connected stars${total > limit ? ' · showing first ' + limit : ''}`;
  $('focus-caption').hidden = false;
  rebuild();
  resizeScene();
  state.network?.cameraPosition(
    { x: 0, y: 0, z: 205 },
    { x: 0, y: 0, z: 0 },
    reduced.matches ? 0 : 900,
  );
}

// Returns to the whole galaxy, closing details and cancelling pending guidance.
export function overview() {
  state.guidance?.cancel();
  state.focusGraph = null;
  state.selected = null;
  document.body.classList.remove('node-focused');
  $('overview').hidden = true;
  $('focus-caption').hidden = true;
  $('details').hidden = true;
  rebuild();
  resizeScene();
  state.network?.cameraPosition(
    { x: 0, y: 0, z: 420 },
    { x: 0, y: 0, z: 0 },
    reduced.matches ? 0 : 900,
  );
}
