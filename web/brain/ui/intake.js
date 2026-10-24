import { $, element } from '../lib/dom.js';
import { api } from '../model/api.js';
import { renderIntakeLayer } from '../scene/intake-layer.js';

// Pending capture counts per domain. Captures are not published knowledge.
export async function intake() {
  try {
    const result = await api('/api/intake');
    $('pending-summary').textContent = `${result.pending.toLocaleString()} pending teachings`;
    $('intake-domains').replaceChildren(
      ...Object.entries(result.domains)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([domain, count]) => element('li', `${domain} · ${count}`)),
    );
    if (!result.pending) $('intake-domains').append(element('li', 'No pending captures'));
    renderIntakeLayer(result.domains);
  } catch {
    $('pending-summary').textContent = 'Pending counts unavailable';
  }
}
