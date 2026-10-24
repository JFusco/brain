import { $, element } from '../lib/dom.js';
import { api } from '../model/api.js';
import { state } from '../model/state.js';
import { renderComparison } from './comparison.js';
import { renderFeedback } from './feedback.js';
import { bindGuidanceActions, cancelActions } from './guidance-actions.js';
import { nodeLink, noteMarkdown, scope } from './guidance-render.js';

// The details panel's guidance: applicability, explained connections, pinned comparison and
// feedback. Each selection takes a new generation; stale responses are discarded.
export function createGuidance() {
  let selected = null,
    generation = 0,
    pinned = null;
  const valid = (ticket, id, snapshot) =>
    generation === ticket && selected === id && state.graph.snapshot === snapshot;

  function renderCompareControls(node, ticket, snapshot) {
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
    if (!pinned || pinned.id === node.id || pinned.snapshot !== snapshot) return;
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

  const readingItem = c => {
    const li = element('li', '');
    li.append(nodeLink(c.node), element('p', c.explanation));
    return li;
  };

  function renderExplanation(result) {
    $('detail-applicability').textContent =
      scope(result.node.applicability) +
      ` Version applicability: ${result.node.compatibility.status}.`;
    if (result.node.whenToUse)
      $('detail-branches').append(noteMarkdown(result.node.whenToUse, result.node));
    if (result.node.guidanceBoundaries)
      $('detail-branches').append(
        element('h3', 'Where guidance differs'),
        noteMarkdown(result.node.guidanceBoundaries, result.node),
      );
    $('relationships').replaceChildren(...result.connections.map(readingItem));
    $('next-reading').replaceChildren(...result.nextReading.map(readingItem));
    if (!result.nextReading.length)
      $('next-reading').append(
        element('li', 'No compatible connected reading is documented. Use a focused search.'),
      );
  }

  async function select(node) {
    selected = node.id;
    const ticket = ++generation,
      snapshot = state.graph.snapshot;
    $('detail-applicability').textContent = 'Loading applicability…';
    $('detail-branches').replaceChildren();
    $('next-reading').replaceChildren();
    $('comparison').replaceChildren();
    $('compare-controls').replaceChildren();
    $('feedback').hidden = node.kind !== 'curated-note';
    $('feedback-status').textContent = '';
    $('feedback-buttons').replaceChildren();
    renderCompareControls(node, ticket, snapshot);
    try {
      const result = await api('/api/explain', {
        node: node.id,
        snapshot,
        versions: $('versions').value || undefined,
      });
      if (!valid(ticket, node.id, snapshot)) return;
      renderExplanation(result);
    } catch (error) {
      if (valid(ticket, node.id, snapshot)) $('detail-applicability').textContent = error.message;
    }
    if (node.kind === 'curated-note')
      await renderFeedback(node, snapshot, () => valid(ticket, node.id, snapshot));
  }

  function reset() {
    generation++;
    cancelActions();
    selected = null;
    pinned = null;
    $('briefing-panel').hidden = true;
  }

  bindGuidanceActions();
  return {
    select,
    reset,
    cancel() {
      generation++;
      selected = null;
    },
  };
}
