import { marked } from 'marked';
import { resolveLink } from './links.js';

// Build only approved DOM elements. Markdown and embedded HTML never enter innerHTML.
export function renderMarkdown(source, { path, title, onNavigate, hasNode }) {
  const create = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function inline(tokens = []) {
    const fragment = document.createDocumentFragment();
    for (const token of tokens) {
      let node;
      if (['strong', 'em', 'del'].includes(token.type)) {
        node = create(token.type === 'del' ? 's' : token.type);
        node.append(inline(token.tokens));
      } else if (token.type === 'codespan') node = create('code', token.text);
      else if (token.type === 'br') node = create('br');
      else if (token.type === 'link') {
        node = create('span');
        node.append(inline(token.tokens));
        const target = resolveLink(token.href, path, hasNode);
        if (target.kind === 'internal') {
          const link = create('a');
          link.href = '#';
          link.append(...node.childNodes);
          link.onclick = event => {
            event.preventDefault();
            onNavigate(target.id);
          };
          node = link;
        } else if (target.kind === 'external') {
          const link = create('a');
          link.href = target.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.append(...node.childNodes);
          node = link;
        }
      } else if (token.type === 'image') node = create('span', token.text || '');
      else if (token.tokens) {
        node = create('span');
        node.append(inline(token.tokens));
      } else node = document.createTextNode(token.text || token.raw || '');
      fragment.append(node);
    }
    return fragment;
  }
  function blocks(tokens) {
    const fragment = document.createDocumentFragment();
    for (const token of tokens) {
      let node;
      if (
        token.type === 'space' ||
        (token.type === 'html' && /^\s*<!--[\s\S]*-->\s*$/.test(token.text))
      )
        continue;
      if (token.type === 'heading') {
        node = create('h' + Math.min(6, token.depth + 1));
        node.append(inline(token.tokens));
      } else if (['paragraph', 'text'].includes(token.type)) {
        node = create('p');
        node.append(token.tokens ? inline(token.tokens) : document.createTextNode(token.text));
      } else if (token.type === 'list') {
        node = create(token.ordered ? 'ol' : 'ul');
        if (token.ordered && Number.isInteger(token.start)) node.start = token.start;
        for (const item of token.items) {
          const li = create('li');
          if (item.task) li.append(document.createTextNode(item.checked ? '☑ ' : '☐ '));
          li.append(blocks(item.tokens));
          node.append(li);
        }
      } else if (token.type === 'code') {
        node = create('pre');
        node.append(create('code', token.text));
      } else if (token.type === 'blockquote') {
        node = create('blockquote');
        node.append(blocks(token.tokens));
      } else if (token.type === 'hr') node = create('hr');
      else if (token.type === 'table') {
        node = create('table');
        const head = create('thead'),
          row = create('tr'),
          body = create('tbody');
        for (const cell of token.header) {
          const th = create('th');
          th.append(inline(cell.tokens));
          row.append(th);
        }
        head.append(row);
        for (const cells of token.rows) {
          const tr = create('tr');
          for (const cell of cells) {
            const td = create('td');
            td.append(inline(cell.tokens));
            tr.append(td);
          }
          body.append(tr);
        }
        node.append(head, body);
      } else node = create('p', token.text || token.raw || '');
      fragment.append(node);
    }
    return fragment;
  }
  const tokens = marked.lexer(source, { gfm: true });
  const first = tokens.findIndex(token => token.type !== 'space');
  if (tokens[first]?.type === 'heading' && tokens[first].text === title) tokens.splice(first, 1);
  return blocks(tokens);
}
