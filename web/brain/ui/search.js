import { $, element } from '../lib/dom.js';
import { loadGraph } from '../live/graph.js';
import { api } from '../model/api.js';
import { navigate } from '../model/navigation.js';
import { adoptSession } from '../model/session.js';
import { state } from '../model/state.js';
import { overview } from '../scene/focus.js';
import { rebuild } from '../scene/network.js';
import { searchVisual } from '../scene/search-visual.js';
import { metrics } from './metrics.js';

function renderResults(result) {
  $('results').replaceChildren(
    ...result.results.map(item => {
      const li = element('li', ''),
        button = element('button', item.title);
      button.onclick = () => navigate(item.id);
      const disconnected = result.connections.find(c => c.target === item.id && !c.path);
      li.append(
        button,
        element(
          'small',
          `${item.kind} · compatibility ${item.compatibility.status}${disconnected ? ' · no graph connection' : ''}`,
        ),
      );
      return li;
    }),
  );
  $('status').textContent = result.results.length
    ? `${result.results.length} ranked sources. Purple paths explain connections.${result.metricsRecorded ? '' : ' Metrics unavailable.'}`
    : 'No matching evidence. This search adds no knowledge automatically.';
}

// Routes a query against the committed snapshot and lights up the evidence paths.
async function search(event) {
  event.preventDefault();
  if (state.focusGraph) overview();
  searchVisual('searching');
  $('submit').disabled = true;
  $('status').textContent = 'Finding relevant evidence…';
  try {
    const started = Date.now(),
      result = await api('/api/route', {
        query: $('query').value,
        domain: $('domain').value || undefined,
        versions: $('versions').value || undefined,
      });
    if (result.snapshot !== state.graph.snapshot) {
      await loadGraph();
      searchVisual('idle');
      $('status').textContent = 'Knowledge changed. Search again on the new snapshot.';
      return;
    }
    adoptSession(result.session, started);
    state.planned.clear();
    for (const item of result.results) if (item.id) state.expanded.add(item.id);
    for (const c of result.connections) for (const id of c.path?.nodes || []) state.planned.add(id);
    rebuild();
    searchVisual(result.results.length ? 'found' : 'empty', result);
    renderResults(result);
    metrics();
  } catch (error) {
    searchVisual('error');
    $('status').textContent = error.message;
  } finally {
    $('submit').disabled = false;
  }
}

export function bindSearch() {
  $('search').onsubmit = search;
}
