import { $, element } from '../lib/dom.js';
import { activityText } from '../lib/knowledge.js';
import { reduced, state } from '../model/state.js';
import { rebuild } from '../scene/network.js';
import { metrics } from '../ui/metrics.js';
import { externalActivity } from './external.js';
import { pulseActivity } from './pulses.js';

// Highlights nodes named by live activity: planned paths for 10 s, other events for 3.5 s.
function markActivity(rows) {
  for (const e of rows) {
    if (e.snapshot === state.graph.snapshot && e.node) {
      state.expanded.add(e.node);
      if (e.type === 'planned') {
        state.planned.add(e.node);
        setTimeout(() => state.planned.delete(e.node), 10000);
      } else {
        state.active.set(e.node, Date.now() + 3500);
        state.activeKinds.set(e.node, e.type);
        if (e.origin !== 'viewer' && ['read', 'cited'].includes(e.type))
          pulseActivity(e.type, { node: e.node });
      }
    }
    if (e.type !== 'planned') state.liveEvents.unshift(activityText(e, state.graph.nodes));
  }
  state.liveEvents = state.liveEvents.slice(0, 12);
}

// Particles run along links whose both ends are currently active.
function emitActiveParticles() {
  const { network, active } = state;
  if (reduced.matches || !network) return;
  for (const link of network.graphData().links) {
    const source = link.source.id || link.source,
      target = link.target.id || link.target;
    if ((active.get(source) || 0) > Date.now() && (active.get(target) || 0) > Date.now())
      network.emitParticle(link);
  }
}

export function eventStream() {
  const sse = new EventSource('/api/events');
  sse.addEventListener('ready', () => {
    $('connection').textContent = 'Live · local';
    $('signal').className = 'live';
    state.liveEvents = [];
    metrics();
  });
  sse.onerror = () => {
    $('connection').textContent = 'Reconnecting';
    $('signal').className = '';
  };
  sse.addEventListener('unavailable', () => {
    $('connection').textContent = 'Metrics unavailable';
    $('signal').className = '';
  });
  sse.onmessage = event => {
    const rows = JSON.parse(event.data);
    markActivity(rows);
    $('activity').replaceChildren(...state.liveEvents.map(t => element('li', t)));
    rebuild();
    externalActivity(rows);
    emitActiveParticles();
    metrics();
  };
}
