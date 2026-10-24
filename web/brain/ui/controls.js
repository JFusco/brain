import { $ } from '../lib/dom.js';
import { reduced, state } from '../model/state.js';
import { color } from '../scene/colors.js';
import { overview } from '../scene/focus.js';
import { motion, rebuild } from '../scene/network.js';
import { choose } from './details.js';
import { metrics } from './metrics.js';

export function bindControls() {
  $('pending-summary').onclick = () => {
    $('intake-panel').hidden = !$('intake-panel').hidden;
    $('pending-summary').setAttribute('aria-expanded', String(!$('intake-panel').hidden));
  };
  $('domain').onchange = () => {
    if (state.focusGraph) overview();
    state.focusedDomain = $('domain').value;
    rebuild();
  };
  $('period').onchange = metrics;
  $('heat').onchange = () => state.network?.nodeColor(color);
  $('close').onclick = overview;
  $('overview').onclick = overview;
  reduced.onchange = () => {
    motion();
    state.network?.linkDirectionalParticles(reduced.matches ? 0 : state.focusGraph ? 3 : 1);
  };
  document.addEventListener('visibilitychange', motion);
  // Version context changes applicability, so the open node is re-explained.
  $('versions').addEventListener('change', () => {
    if (state.selected) choose(state.selected);
  });
}
