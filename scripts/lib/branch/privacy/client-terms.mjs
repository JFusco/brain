import { config } from '../platform/config.mjs';
import { sha } from '../../leaf/hash.mjs';

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function terms() {
  const c = config();
  return [...new Set([...(c.clientTerms || []), ...(c.clientAliases || [])])]
    .filter(t => typeof t === 'string' && t.trim().length >= 3)
    .sort((a, b) => b.length - a.length);
}
// Terms default to the private configuration; tests and callers may pass them explicitly.
export function clientHits(text, list = terms()) {
  return list.filter(term =>
    new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`, 'i').test(text),
  );
}
export function scrub(text, list = terms()) {
  for (const term of list)
    text = text.replace(
      new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`, 'gi'),
      '<client>',
    );
  return text;
}
export function policyHash() {
  const c = config();
  return sha(JSON.stringify({ version: 2, terms: terms(), scanner: c.toolchain.gitleaksVersion }));
}
