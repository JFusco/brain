import { domainAnchor } from '../lib/layout.js';
import { state } from '../model/state.js';
import { placed } from '../scene/network.js';
import { heartbeat } from '../ui/heartbeat.js';

const SECTOR = 80,
  RIM = 168,
  AFTERGLOW = {
    search: '#8ceaff',
    found: '#8ceaff',
    capture: '#c194ff',
    read: '#a3ffe1',
    cited: '#ffdf9e',
  };

// Domains of the named graph nodes, in first-seen order, at most four.
export function nodeDomains(ids) {
  const domains = new Set();
  for (const id of ids) {
    const node = state.graph?.nodes.find(n => n.id === id);
    const domain = node?.domain || node?.domains?.[0];
    if (domain) domains.add(domain);
  }
  return [...domains].slice(0, 4);
}

// One activity: a pulse where it happened, the domain's afterglow and a heartbeat blip.
// Activity without a known domain or node pulses at the galaxy core.
export function pulseActivity(kind, { domain = null, node = null, beat = true } = {}) {
  const domains = state.graph?.domains || [],
    star = node ? state.graph?.nodes.find(n => n.id === node) : null;
  domain ??= star?.domain || star?.domains?.[0] || null;
  if (kind === 'capture') state.captureNebula?.trigger(domainAnchor(domain, domains, RIM, 0.85));
  // A star outside the focused neighborhood is not drawn, so it gets no halo.
  else if (star && (!state.focusGraph || state.focusGraph.ids.has(star.id)))
    state.pulses?.emit(kind, placed(star), true);
  else if (!star) state.pulses?.emit(kind, domainAnchor(domain, domains, SECTOR));
  if (AFTERGLOW[kind] && domain)
    state.afterglow?.bump(domain, domainAnchor(domain, domains, SECTOR), AFTERGLOW[kind]);
  if (beat) heartbeat(kind);
}
