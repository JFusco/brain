import { sha } from '../../../leaf/hash.mjs';

export function nodeID(item) {
  if (item.kind === 'installed-documentation') return null;
  return item.url ? `url:${sha(item.url)}` : item.path?.startsWith('knowledge/') ? item.path : null;
}
export function https(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
  } catch {
    return null;
  }
}
