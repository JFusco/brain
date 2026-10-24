import { $, element } from '../lib/dom.js';
import { activityText, domainCoverage, usageText } from '../lib/knowledge.js';
import { api } from '../model/api.js';
import { navigate } from '../model/navigation.js';
import { metricDisplays, reduced, state } from '../model/state.js';
import { rebuild } from '../scene/network.js';

const FIELDS = [
  ['search', 'LOOKUPS'],
  ['returned', 'RETURNED'],
  ['read', 'READ'],
  ['cited', 'CITED'],
  ['captured', 'CAPTURES'],
  ['no-results', 'NO RESULTS'],
];

function metricDisplay(key, label) {
  let display = metricDisplays.get(key);
  if (!display) {
    const item = element('div', ''),
      dial = element('div', ''),
      value = element('div', ''),
      number = element('b', '0');
    item.className = 'metric';
    dial.className = 'dial';
    dial.setAttribute('aria-hidden', 'true');
    dial.append(element('i', ''));
    value.append(number, element('span', label));
    item.append(dial, value);
    $('totals').append(item);
    display = { item, number, value: 0, target: 0 };
    metricDisplays.set(key, display);
  }
  return display;
}

// Updates dashboard targets; the animation loop eases displayed values toward them.
function renderTotals() {
  const { stats } = state;
  for (const [key, label] of FIELDS) {
    const display = metricDisplay(key, label),
      target = stats.totals[key] || 0;
    if (target !== display.target) {
      display.target = target;
      display.item.classList.remove('flash');
      void display.item.offsetWidth;
      display.item.classList.add('flash');
    }
    if (!state.network || reduced.matches) {
      display.value = target;
      display.number.textContent = target.toLocaleString();
    }
  }
  $('activity-state').textContent = Object.values(stats.totals).some(value => value > 0)
    ? 'Recording live'
    : 'Awaiting activity';
}

export function coverage() {
  if (!state.graph) return;
  $('coverage').replaceChildren(
    ...domainCoverage(state.graph, state.stats).map(({ domain, notes, refs, usage }) => {
      const button = element(
        'button',
        `${domain} · ${notes} notes / ${refs} refs / ${usage} returns`,
      );
      button.onclick = () => {
        state.focusedDomain = state.focusedDomain === domain ? '' : domain;
        $('domain').value = state.focusedDomain;
        rebuild();
      };
      return button;
    }),
  );
}

export async function metrics() {
  try {
    state.stats = await api(`/api/metrics?period=${$('period').value}`);
    const { stats, graph } = state;
    renderTotals();
    $('history').textContent =
      `Recorded activity since ${stats.firstRecorded || 'now'} · America/New_York · Agent reads and citations are self-reported. Counts span revisions.`;
    const popular = Object.entries(stats.nodes)
      .sort((a, b) => b[1].returned - a[1].returned)
      .slice(0, 5);
    $('popular').replaceChildren(
      ...popular.map(([id, c]) => {
        const li = element('li', ''),
          n = graph.nodes.find(n => n.id === id);
        const button = element('button', `${n?.title || 'Historical reference'} · ${c.returned}`);
        button.onclick = () => navigate(id);
        li.append(button);
        return li;
      }),
    );
    if (!state.liveEvents.length) {
      $('activity').replaceChildren(
        ...(stats.recent || [])
          .filter(e => e.type !== 'planned')
          .slice(0, 12)
          .map(e => element('li', activityText(e, graph.nodes))),
      );
    }
    coverage();
    if (state.selected) $('detail-metrics').textContent = usageText(stats.nodes[state.selected]);
  } catch {
    $('history').textContent = 'Activity metrics unavailable. Knowledge remains accessible.';
  }
}
