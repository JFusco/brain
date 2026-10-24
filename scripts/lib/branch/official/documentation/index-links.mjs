const ENTITIES = {
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
};
const decode = text => text.replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g, value => ENTITIES[value]);
const GENERIC_TITLE = /^(?:more|read more|read article|learn more|here|details)$/i;
const pathTitle = pathname =>
  decodeURIComponent(pathname).split('/').filter(Boolean).slice(-2).join(' / ').replace(/-/g, ' ');

// Static anchors only. No scripts, styles, embedded resources or recursive page crawling.
export function htmlLinks(index, base) {
  const clean = index.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  const links = [];
  for (const match of clean.matchAll(
    /<a\b[^>]*?\s+href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a\s*>/gi,
  )) {
    let title = decode(match[3].replace(/<[^>]*>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    if (GENERIC_TITLE.test(title))
      try {
        title = pathTitle(new URL(decode(match[2]), base).pathname);
      } catch {
        continue;
      }
    if (title) links.push({ href: decode(match[2]), title });
  }
  return links;
}

// Nested sitemap indexes are returned for crawling; page links are titled from their path.
export function sitemapLinks(index, allowedHosts) {
  const indexes = [];
  const links = [];
  for (const match of index.matchAll(/<loc>\s*(?:<!\[CDATA\[)?([^<]+?)(?:\]\]>)?\s*<\/loc>/g)) {
    const href = match[1].replace(/&amp;/g, '&').trim();
    let target;
    try {
      target = new URL(href);
    } catch {
      continue;
    }
    if (
      target.protocol !== 'https:' ||
      target.username ||
      target.password ||
      !allowedHosts.includes(target.hostname)
    )
      continue;
    if (/\.xml(?:\.gz)?$/.test(target.pathname)) indexes.push(target.href);
    else links.push({ href, title: pathTitle(target.pathname) });
  }
  return { indexes, links };
}

export const markdownLinks = index =>
  [...index.matchAll(/\[([^\]\n]+)\]\(([^\s)]+)\)/g)].map(match => ({
    href: match[2],
    title: match[1],
  }));
