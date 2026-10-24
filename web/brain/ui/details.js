import { $, element } from '../lib/dom.js';
import { usageText } from '../lib/knowledge.js';
import { renderMarkdown } from '../lib/markdown.js';
import { api } from '../model/api.js';
import { currentSession, dropSession } from '../model/session.js';
import { state } from '../model/state.js';
import { focusNode } from '../scene/focus.js';

function healthText(n) {
  const currentness =
    n.freshness?.status === 'needs-revalidation'
      ? 'Needs attention — source changes or a review date require verification.'
      : n.kind === 'curated-note'
        ? 'No current revalidation signal; applicability still matters.'
        : '';
  const referenceHealth = n.linkHealth
    ? `Link check: ${n.linkHealth.state}${n.linkHealth.checkedAt ? ' · ' + new Date(n.linkHealth.checkedAt).toLocaleString() : ''}. Link availability does not verify technical guidance.`
    : n.kind === 'curated-note'
      ? ''
      : 'Reference health unknown unless a local check recorded it.';
  return [currentness, referenceHealth].filter(Boolean).join(' ');
}

function renderLinks(n) {
  $('detail-links').replaceChildren();
  if (n.url) {
    const a = element('a', 'Open official reference ↗');
    a.href = n.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    $('detail-links').append(a);
  }
  if (n.kind === 'source') {
    const button = element('button', 'Show up to 80 connected stars');
    button.onclick = () => focusNode(n.id, 80);
    $('detail-links').append(button);
  }
}

function renderRelationships(id) {
  const { graph } = state;
  const rel = graph.edges.filter(e => e.source === id || e.target === id).slice(0, 24);
  $('relationships').replaceChildren(
    ...rel.map(e => {
      const other = graph.nodes.find(x => x.id === (e.source === id ? e.target : e.source));
      const li = element('li', ''),
        button = element('button', other?.title || 'reference');
      button.onclick = () => choose(other.id);
      li.append(element('span', e.relation + ': '), button);
      return li;
    }),
  );
}

// Reads the note body within the activity session, so the read is recorded.
async function loadNote(n) {
  const id = n.id;
  try {
    const attemptedSession = await currentSession(),
      result = await api('/api/note', {
        node: id,
        session: attemptedSession,
        snapshot: state.graph.snapshot,
      });
    if (!result.metricsRecorded) dropSession(attemptedSession);
    if (state.selected === id) {
      $('note').replaceChildren(
        renderMarkdown(result.body, {
          path: id,
          title: n.title,
          onNavigate: choose,
          hasNode: target => state.graph.nodes.some(node => node.id === target),
        }),
      );
      if (!result.metricsRecorded) $('detail-metrics').textContent += ' · Read not recorded';
    }
  } catch (error) {
    if (state.selected === id) $('note').textContent = error.message;
  }
}

// Opens a node: focuses its neighborhood and fills the details panel.
export async function choose(id) {
  const n = state.graph.nodes.find(n => n.id === id);
  if (!n) return;
  state.selected = id;
  focusNode(id);
  $('details').hidden = false;
  $('detail-kind').textContent =
    n.format === 'playbook' ? 'Proposed playbook' : n.kind.replaceAll('-', ' ');
  $('detail-title').textContent = n.title;
  state.guidance.select(n);
  $('detail-health').textContent = healthText(n);
  $('note').textContent = '';
  renderLinks(n);
  $('detail-metrics').textContent = usageText(state.stats?.nodes[id]);
  renderRelationships(id);
  if (n.kind === 'curated-note' || n.kind === 'index') await loadNote(n);
}
