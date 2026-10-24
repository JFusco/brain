import { $, element } from '../lib/dom.js';
import { noteMarkdown, scope } from './guidance-render.js';

// Side-by-side applicability of two pinned stars, with the server's stated differences.
export function renderComparison(result) {
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
    if (node.guidanceBoundaries) card.append(noteMarkdown(node.guidanceBoundaries, node));
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
