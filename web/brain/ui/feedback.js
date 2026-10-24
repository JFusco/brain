import { $, element } from '../lib/dom.js';
import { api } from '../model/api.js';

const LABELS = {
  helped: 'Helped',
  'needs-clarification': 'Needs clarification',
  'did-not-apply': 'Did not apply',
  clear: 'Clear response',
};

// One local usefulness response per note version. `isCurrent` reports whether the panel
// still shows this node and snapshot, so late responses never overwrite a newer selection.
export async function renderFeedback(node, snapshot, isCurrent) {
  const buttons = [];
  const show = result => {
    for (const button of buttons)
      button.setAttribute('aria-pressed', String(button.dataset.value === result.value));
    $('feedback-status').textContent = result.value
      ? 'Saved locally: ' + LABELS[result.value]
      : 'No response for this note version.';
  };
  for (const [value, label] of Object.entries(LABELS)) {
    const button = element('button', label);
    button.type = 'button';
    button.dataset.value = value;
    button.setAttribute('aria-pressed', 'false');
    button.disabled = true;
    button.onclick = async () => {
      buttons.forEach(b => (b.disabled = true));
      try {
        const result = await api('/api/feedback', { node: node.id, snapshot, value });
        if (isCurrent()) show(result);
      } catch (error) {
        if (isCurrent())
          $('feedback-status').textContent = 'Feedback was not confirmed: ' + error.message;
      } finally {
        buttons.forEach(b => (b.disabled = false));
      }
    };
    buttons.push(button);
  }
  if (!isCurrent()) return;
  $('feedback-buttons').replaceChildren(...buttons);
  try {
    const result = await api('/api/feedback', { node: node.id, snapshot });
    if (isCurrent()) {
      show(result);
      buttons.forEach(b => (b.disabled = false));
    }
  } catch {
    if (isCurrent())
      $('feedback-status').textContent = 'Local feedback unavailable. The note remains readable.';
  }
}
