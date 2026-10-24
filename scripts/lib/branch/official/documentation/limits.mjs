import { sha } from '../../../leaf/hash.mjs';

export const DEFAULT_MAX_INDEXES = 32,
  MAX_INDEXES = 128;
export function indexLimit(spec) {
  const limit = Object.hasOwn(spec, 'maxIndexes') ? spec.maxIndexes : DEFAULT_MAX_INDEXES;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_INDEXES)
    throw new Error(`maxIndexes must be an integer from 1 to ${MAX_INDEXES}`);
  return limit;
}

export function bounded(spec, pages) {
  if (!pages.length) throw new Error('Official source contains no matching documentation links');
  if (pages.length > (spec.maxPages ?? 5000))
    throw new Error('Documentation catalog exceeds its page bound; refusing a partial catalog');
  return pages.sort((a, b) => a.url.localeCompare(b.url));
}
// Collection revisions keep the digest of the former PAGES.json serialization, so earlier citations stay comparable.
export const pageDigest = (spec, origin, pages) =>
  sha(
    JSON.stringify(
      { schemaVersion: 1, source: spec.id, domains: spec.domains, origin, pages },
      null,
      2,
    ) + '\n',
  );
