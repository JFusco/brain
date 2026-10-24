import { $, element } from '../lib/dom.js';
import { renderMarkdown } from '../lib/markdown.js';
import { navigate } from '../model/navigation.js';
import { state } from '../model/state.js';

// Applicability arrives as prose or structured scope.
export const scope = value => (typeof value === 'string' ? value : JSON.stringify(value));

export function noteMarkdown(body, node) {
  return renderMarkdown(body, {
    path: node.path || node.id,
    title: '',
    onNavigate: navigate,
    hasNode: id => state.graph.nodes.some(n => n.id === id),
  });
}

// A button that closes the briefing and opens the node.
export function nodeLink(node) {
  const button = element('button', node.title);
  button.type = 'button';
  button.onclick = () => {
    $('briefing-panel').hidden = true;
    navigate(node.id);
  };
  return button;
}
