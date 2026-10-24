import { writeJSON } from '../../leaf/fs-safe.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { publishedGuidance } from '../../branch/guidance/published.mjs';

export function staleGuidance({ limit = 12, write = false } = {}) {
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error('Guidance limit must be between 1 and 100');
  const pages = publishedGuidance()
    .filter(page => page.freshness.status === 'needs-revalidation')
    .map(({ path, title, domain, sha256, freshness }) => ({
      path,
      title,
      domain,
      sha256,
      ...freshness,
    }));
  pages.sort(
    (a, b) =>
      Number(b.reasons.some(r => r.kind === 'source-changed')) -
        Number(a.reasons.some(r => r.kind === 'source-changed')) ||
      (a.reviewDueAt || '').localeCompare(b.reviewDueAt || '') ||
      a.path.localeCompare(b.path),
  );
  const result = {
    generatedAt: now(),
    total: pages.length,
    pages: pages.slice(0, limit),
    notice:
      'A changed source or elapsed review date requires claim verification, not automatic replacement of provenance or advice.',
  };
  if (write) writeJSON(at('.state/notes-needing-review.json'), result, 0o600);
  return result;
}
