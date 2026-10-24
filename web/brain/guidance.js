import { renderMarkdown } from './markdown.js';
const $ = id => document.getElementById(id);
const element = (tag, text) => {
  const e = document.createElement(tag);
  e.textContent = text;
  return e;
};
const scope = value => (typeof value === 'string' ? value : JSON.stringify(value));
export function createGuidance({ api, getGraph, onNavigate, onSession, onBrowse }) {
  let selected = null,
    generation = 0,
    pinned = null,
    actionGeneration = 0;
  const labels = {
    helped: 'Helped',
    'needs-clarification': 'Needs clarification',
    'did-not-apply': 'Did not apply',
    clear: 'Clear response',
  };
  function markdown(body, node) {
    return renderMarkdown(body, {
      path: node.path || node.id,
      title: '',
      onNavigate,
      hasNode: id => getGraph().nodes.some(n => n.id === id),
    });
  }
  function link(node) {
    const button = element('button', node.title);
    button.type = 'button';
    button.onclick = () => {
      $('briefing-panel').hidden = true;
      onNavigate(node.id);
    };
    return button;
  }
  function valid(ticket, id, snapshot) {
    return generation === ticket && selected === id && getGraph().snapshot === snapshot;
  }
  function renderComparison(result) {
    $('comparison').replaceChildren(element('h3', 'Guidance comparison'));
    for (const node of [result.left, result.right]) {
      const card = element('section', '');
      card.append(
        element('h4', node.title),
        element('p', scope(node.applicability)),
        element(
          'p',
          `Version applicability: ${node.compatibility.status} — ${node.compatibility.reason}`,
        ),
      );
      if (node.guidanceBoundaries) card.append(markdown(node.guidanceBoundaries, node));
      if (node.url) {
        const a = element('a', 'Read official source ↗');
        a.href = node.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        card.append(a);
      }
      $('comparison').append(card);
    }
    for (const difference of result.differences) $('comparison').append(element('p', difference));
    $('comparison').append(element('p', result.notice));
  }
  async function select(node) {
    selected = node.id;
    const ticket = ++generation,
      snapshot = getGraph().snapshot;
    $('detail-applicability').textContent = 'Loading applicability…';
    $('detail-branches').replaceChildren();
    $('next-reading').replaceChildren();
    $('comparison').replaceChildren();
    $('compare-controls').replaceChildren();
    $('feedback').hidden = node.kind !== 'curated-note';
    $('feedback-status').textContent = '';
    $('feedback-buttons').replaceChildren();
    const pin = element(
      'button',
      pinned?.id === node.id ? 'Unpin comparison' : 'Compare this star',
    );
    pin.type = 'button';
    pin.setAttribute('aria-pressed', String(pinned?.id === node.id));
    pin.onclick = () => {
      pinned = pinned?.id === node.id ? null : { id: node.id, title: node.title, snapshot };
      select(node);
    };
    $('compare-controls').append(pin);
    if (pinned && pinned.id !== node.id && pinned.snapshot === snapshot) {
      const compare = element('button', 'Compare with ' + pinned.title);
      compare.type = 'button';
      compare.onclick = async () => {
        compare.disabled = true;
        try {
          const result = await api('/api/compare', {
            from: pinned.id,
            to: node.id,
            snapshot,
            versions: $('versions').value || undefined,
          });
          if (valid(ticket, node.id, snapshot)) renderComparison(result);
        } catch (error) {
          if (valid(ticket, node.id, snapshot)) $('comparison').textContent = error.message;
        } finally {
          compare.disabled = false;
        }
      };
      $('compare-controls').append(compare);
    }
    try {
      const result = await api('/api/explain', {
        node: node.id,
        snapshot,
        versions: $('versions').value || undefined,
      });
      if (!valid(ticket, node.id, snapshot)) return;
      $('detail-applicability').textContent =
        scope(result.node.applicability) +
        ` Version applicability: ${result.node.compatibility.status}.`;
      if (result.node.whenToUse)
        $('detail-branches').append(markdown(result.node.whenToUse, result.node));
      if (result.node.guidanceBoundaries)
        $('detail-branches').append(
          element('h3', 'Where guidance differs'),
          markdown(result.node.guidanceBoundaries, result.node),
        );
      $('relationships').replaceChildren(
        ...result.connections.map(c => {
          const li = element('li', '');
          li.append(link(c.node), element('p', c.explanation));
          return li;
        }),
      );
      $('next-reading').replaceChildren(
        ...result.nextReading.map(c => {
          const li = element('li', '');
          li.append(link(c.node), element('p', c.explanation));
          return li;
        }),
      );
      if (!result.nextReading.length)
        $('next-reading').append(
          element('li', 'No compatible connected reading is documented. Use a focused search.'),
        );
    } catch (error) {
      if (valid(ticket, node.id, snapshot)) $('detail-applicability').textContent = error.message;
    }
    if (node.kind === 'curated-note') {
      const buttons = [];
      const show = result => {
        for (const button of buttons)
          button.setAttribute('aria-pressed', String(button.dataset.value === result.value));
        $('feedback-status').textContent = result.value
          ? 'Saved locally: ' + labels[result.value]
          : 'No response for this note version.';
      };
      for (const [value, label] of Object.entries(labels)) {
        const button = element('button', label);
        button.type = 'button';
        button.dataset.value = value;
        button.setAttribute('aria-pressed', 'false');
        button.disabled = true;
        button.onclick = async () => {
          buttons.forEach(b => (b.disabled = true));
          try {
            const result = await api('/api/feedback', { node: node.id, snapshot, value });
            if (valid(ticket, node.id, snapshot)) show(result);
          } catch (error) {
            if (valid(ticket, node.id, snapshot))
              $('feedback-status').textContent = 'Feedback was not confirmed: ' + error.message;
          } finally {
            buttons.forEach(b => (b.disabled = false));
          }
        };
        buttons.push(button);
      }
      if (!valid(ticket, node.id, snapshot)) return;
      $('feedback-buttons').replaceChildren(...buttons);
      try {
        const result = await api('/api/feedback', { node: node.id, snapshot });
        if (valid(ticket, node.id, snapshot)) {
          show(result);
          buttons.forEach(b => (b.disabled = false));
        }
      } catch {
        if (valid(ticket, node.id, snapshot))
          $('feedback-status').textContent =
            'Local feedback unavailable. The note remains readable.';
      }
    }
  }
  function reset() {
    generation++;
    actionGeneration++;
    selected = null;
    pinned = null;
    $('briefing-panel').hidden = true;
  }
  $('close-briefing').onclick = () => {
    $('briefing-panel').hidden = true;
  };
  $('show-playbooks').onclick = async () => {
    const ticket = ++actionGeneration;
    $('show-playbooks').disabled = true;
    try {
      const result = await api('/api/playbooks', {
        domain: $('domain').value || undefined,
        versions: $('versions').value || undefined,
      });
      if (ticket !== actionGeneration) return;
      if (result.snapshot !== getGraph().snapshot)
        throw new Error('Knowledge changed; refresh before browsing playbooks');
      onBrowse();
      $('results').replaceChildren(
        ...result.playbooks.map(n => {
          const li = element('li', '');
          li.append(link(n), element('small', scope(n.applicability)));
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
  };
  $('make-brief').onclick = async () => {
    if (!$('query').reportValidity()) return;
    const ticket = ++actionGeneration;
    $('make-brief').disabled = true;
    try {
      const started = Date.now(),
        result = await api('/api/brief', {
          query: $('query').value,
          domain: $('domain').value || undefined,
          versions: $('versions').value || undefined,
        });
      if (ticket !== actionGeneration) return;
      if (result.snapshot !== getGraph().snapshot)
        throw new Error('Knowledge changed; refresh before preparing a briefing');
      onSession(result, started);
      $('briefing-panel').hidden = false;
      $('briefing-content').replaceChildren(element('p', result.task));
      if (result.gaps.length) {
        $('briefing-content').append(element('h3', 'Applicability and evidence gaps'));
        const ul = element('ul', '');
        for (const gap of result.gaps) ul.append(element('li', gap));
        $('briefing-content').append(ul);
      }
      $('briefing-content').append(element('h3', 'Ranked evidence to read'));
      for (const evidence of result.evidence) {
        const card = element('section', '');
        card.append(
          evidence.id ? link(evidence) : element('strong', evidence.title),
          element('p', scope(evidence.applicability)),
        );
        if (evidence.guidanceBoundaries)
          card.append(
            element('h4', 'Where guidance differs'),
            markdown(evidence.guidanceBoundaries, evidence),
          );
        $('briefing-content').append(card);
      }
      $('briefing-content').append(element('h3', 'Next steps'));
      const ol = element('ol', '');
      for (const step of result.nextSteps) ol.append(element('li', step));
      $('briefing-content').append(
        ol,
        element(
          'p',
          'For a task-specific recommendation, ask the Brain skill to read these sources and prepare the briefing. The viewer shows evidence and gaps; it does not generate an answer.',
        ),
      );
    } catch (error) {
      $('status').textContent = error.message;
    } finally {
      $('make-brief').disabled = false;
    }
  };
  return {
    select,
    reset,
    cancel() {
      generation++;
      selected = null;
    },
  };
}
