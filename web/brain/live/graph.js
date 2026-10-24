import { $, element } from '../lib/dom.js';
import { overviewReferences } from '../lib/knowledge.js';
import { api } from '../model/api.js';
import { resetSession } from '../model/session.js';
import { state } from '../model/state.js';
import { overview } from '../scene/focus.js';
import { rebuild } from '../scene/network.js';
import { coverage } from '../ui/metrics.js';

function renderInventory(graph) {
  const notes = graph.nodes.filter(n => n.kind === 'curated-note').length,
    references = graph.nodes.filter(n => n.url).length;
  $('inventory').textContent =
    `${notes.toLocaleString()} notes / ${references.toLocaleString()} references`;
  $('snapshot').textContent =
    `MAIN ${graph.snapshot.slice(0, 12)} · ${notes} NOTES · ${references} REFERENCES`;
  $('domain').replaceChildren(
    element('option', 'All domains'),
    ...graph.domains.map(d => {
      const o = element('option', d);
      o.value = d;
      return o;
    }),
  );
  $('domain').firstChild.value = '';
  $('domain').value = state.focusedDomain;
}

// Loads the committed snapshot. A new snapshot resets selection, guidance and the session,
// and briefly marks nodes that were not in the previous one.
export async function loadGraph() {
  const next = await api('/api/graph');
  if (state.lastGraph === next.snapshot) {
    state.graph = next;
    return;
  }
  state.guidance?.reset();
  const prior = state.known;
  state.known = new Set(next.nodes.map(n => n.id));
  state.graph = next;
  state.lastGraph = next.snapshot;
  resetSession();
  overview();
  state.overviewReferences = overviewReferences(next);
  if (prior.size)
    for (const id of state.known) if (!prior.has(id)) state.fresh.set(id, Date.now() + 4000);
  renderInventory(next);
  rebuild();
  coverage();
}
