const BASE = 'https://brain.invalid';

// Classifies a Markdown link written in the note at `path`. Internal links must name a known
// graph node; external links must be credential-free HTTPS. Anything else stays inert text.
export function resolveLink(href, path, hasNode) {
  try {
    const url = new URL(href, `${BASE}/` + path);
    const id = decodeURIComponent(url.pathname.slice(1));
    if (url.origin === BASE && hasNode(id)) return { kind: 'internal', id };
    if (url.origin !== BASE && url.protocol === 'https:' && !url.username && !url.password)
      return { kind: 'external', href: url.href };
  } catch {
    /* An unsupported destination stays inert text. */
  }
  return { kind: 'inert' };
}
