import { hubDomain } from '../lib/activity.js';
import { externalSessions, state } from '../model/state.js';
import { rebuild } from '../scene/network.js';
import { searchVisual } from '../scene/search-visual.js';
import { intake } from '../ui/intake.js';
import { pulseActivity } from './pulses.js';

const newSession = () => ({ results: [], nodes: new Set() });

function trackEvents(events) {
  for (const event of events) {
    if (event.type === 'search-started') {
      externalSessions.set(event.session, newSession());
      searchVisual('searching', { domain: hubDomain(event.node) });
      clearTimeout(state.externalSearchTimer);
      state.externalSearchTimer = setTimeout(() => {
        if (state.searchStage === 'searching') searchVisual('idle');
      }, 30000);
    }
    if (['returned', 'planned'].includes(event.type)) {
      const session = externalSessions.get(event.session) || newSession();
      if (event.node) {
        session.nodes.add(event.node);
        if (event.type === 'returned') session.results.push({ id: event.node });
      }
      externalSessions.set(event.session, session);
    }
    if (event.type === 'no-results') searchVisual('empty');
    if (event.type === 'search-failed') searchVisual('error');
  }
}

// Replays searches made by agents or the CLI on this snapshot as search animations.
export function externalActivity(rows) {
  const { graph } = state;
  // Intake remains relevant when local main advances; each capture queues its own nebula.
  const captures = rows.filter(event => event.origin !== 'viewer' && event.type === 'captured');
  for (const event of captures) pulseActivity('capture', { domain: hubDomain(event.node) });
  if (captures.length) intake();
  const events = rows.filter(
    event => event.origin !== 'viewer' && event.snapshot === graph.snapshot,
  );
  if (!events.length) return;
  trackEvents(events);
  const sessions = new Set(
    events
      .filter(event => ['search', 'returned', 'planned'].includes(event.type))
      .map(event => event.session),
  );
  for (const id of sessions) {
    const session = externalSessions.get(id);
    if (!session?.results.length) {
      if (events.some(event => event.session === id && event.type === 'returned'))
        searchVisual('external');
      continue;
    }
    const edges = graph.edges.filter(
      edge => session.nodes.has(edge.source) && session.nodes.has(edge.target),
    );
    if (!edges.length) {
      const returned = new Set(session.results.map(result => result.id));
      edges.push(
        ...graph.edges
          .filter(edge => returned.has(edge.source) || returned.has(edge.target))
          .slice(0, 24),
      );
      for (const edge of edges) {
        session.nodes.add(edge.source);
        session.nodes.add(edge.target);
        state.expanded.add(edge.source);
        state.expanded.add(edge.target);
      }
      rebuild();
    }
    searchVisual('found', {
      results: session.results,
      connections: [{ path: { nodes: [...session.nodes], edges } }],
    });
  }
  while (externalSessions.size > 30) externalSessions.delete(externalSessions.keys().next().value);
}
