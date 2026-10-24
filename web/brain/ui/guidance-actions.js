import { $, element } from '../lib/dom.js';
import { api } from '../model/api.js';
import { adoptSession } from '../model/session.js';
import { state } from '../model/state.js';
import { overview } from '../scene/focus.js';
import { nodeLink, noteMarkdown, scope } from './guidance-render.js';
import { metrics } from './metrics.js';

// Only the latest playbook or brief request may render; a snapshot refresh cancels both.
let generation = 0;

export function cancelActions() {
  generation++;
}

async function showPlaybooks() {
  const ticket = ++generation;
  $('show-playbooks').disabled = true;
  try {
    const result = await api('/api/playbooks', {
      domain: $('domain').value || undefined,
      versions: $('versions').value || undefined,
    });
    if (ticket !== generation) return;
    if (result.snapshot !== state.graph.snapshot)
      throw new Error('Knowledge changed; refresh before browsing playbooks');
    overview();
    $('results').replaceChildren(
      ...result.playbooks.map(n => {
        const li = element('li', '');
        li.append(nodeLink(n), element('small', scope(n.applicability)));
        return li;
      }),
    );
    $('status').textContent =
      result.playbooks.length + ' proposed playbooks. Open one to read its sources and limits.';
  } catch (error) {
    $('status').textContent = error.message;
  } finally {
    $('show-playbooks').disabled = false;
  }
}

function renderBrief(result) {
  const content = $('briefing-content');
  content.replaceChildren(element('p', result.task));
  if (result.gaps.length) {
    content.append(element('h3', 'Applicability and evidence gaps'));
    const ul = element('ul', '');
    for (const gap of result.gaps) ul.append(element('li', gap));
    content.append(ul);
  }
  content.append(element('h3', 'Ranked evidence to read'));
  for (const evidence of result.evidence) {
    const card = element('section', '');
    card.append(
      evidence.id ? nodeLink(evidence) : element('strong', evidence.title),
      element('p', scope(evidence.applicability)),
    );
    if (evidence.guidanceBoundaries)
      card.append(
        element('h4', 'Where guidance differs'),
        noteMarkdown(evidence.guidanceBoundaries, evidence),
      );
    content.append(card);
  }
  content.append(element('h3', 'Next steps'));
  const ol = element('ol', '');
  for (const step of result.nextSteps) ol.append(element('li', step));
  content.append(
    ol,
    element(
      'p',
      'For a task-specific recommendation, ask the Brain skill to read these sources and prepare the briefing. The viewer shows evidence and gaps; it does not generate an answer.',
    ),
  );
}

async function makeBrief() {
  if (!$('query').reportValidity()) return;
  const ticket = ++generation;
  $('make-brief').disabled = true;
  try {
    const started = Date.now(),
      result = await api('/api/brief', {
        query: $('query').value,
        domain: $('domain').value || undefined,
        versions: $('versions').value || undefined,
      });
    if (ticket !== generation) return;
    if (result.snapshot !== state.graph.snapshot)
      throw new Error('Knowledge changed; refresh before preparing a briefing');
    adoptSession(result.session, started);
    metrics();
    $('briefing-panel').hidden = false;
    renderBrief(result);
  } catch (error) {
    $('status').textContent = error.message;
  } finally {
    $('make-brief').disabled = false;
  }
}

export function bindGuidanceActions() {
  $('close-briefing').onclick = () => {
    $('briefing-panel').hidden = true;
  };
  $('show-playbooks').onclick = showPlaybooks;
  $('make-brief').onclick = makeBrief;
}
