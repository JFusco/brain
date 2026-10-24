import { tokens } from '../search/tokens.mjs';

export function excerpt(text, query, html = false) {
  // Prefer the publisher's explicit content landmark over navigation and chat UI.
  if (html)
    text =
      text.match(/<main\b[^>]*\bid=["']main-content["'][^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? text;
  const plain = html
    ? text
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<\/(?:p|div|section|h[1-6]|li)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(
          /&(?:nbsp|amp|lt|gt|quot);/g,
          entity =>
            ({ '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' })[entity],
        )
    : text;
  const lines = html
      ? plain
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean)
      : plain.split(/\r?\n/),
    words = tokens(query);
  let best = 0,
    bestScore = -1;
  for (let index = 0; index < lines.length; index++) {
    const window = lines
      .slice(index, index + 12)
      .join(' ')
      .toLowerCase();
    const score = words.reduce((total, word) => total + (window.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = index;
    }
  }
  return lines
    .slice(Math.max(0, best - 1), best + 22)
    .join('\n')
    .trim()
    .slice(0, 2500);
}
