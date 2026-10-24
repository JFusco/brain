import { sha } from '../../leaf/hash.mjs';
import { versionFit } from '../project/versions.mjs';
import { tokens } from './tokens.mjs';

export function rankEntries(entries, { query, target, health = { links: {} }, limit = 5 }) {
  let incompatible = 0;
  const words = tokens(query);
  const ranked = entries
    .map(item => {
      const fit = versionFit(item.versions, target);
      if (fit.status === 'incompatible') {
        incompatible++;
        return null;
      }
      const title = tokens(item.title),
        context = tokens(
          JSON.stringify([
            item.summary,
            item.domain,
            item.domains,
            item.source,
            item.url,
            item.applicability,
          ]),
        );
      const matched = words.filter(word => title.includes(word) || context.includes(word));
      if (!matched.length) return null;
      const linkHealth = item.url ? health.links[sha(item.url)] : null;
      const score =
        matched.length ** 2 +
        words.reduce(
          (sum, word) => sum + (title.includes(word) ? 4 : context.includes(word) ? 1 : 0),
          0,
        ) +
        (item.kind === 'installed-documentation'
          ? 20
          : fit.status === 'matched'
            ? 8
            : item.kind === 'curated-note'
              ? 1
              : 0) -
        (item.freshness?.status === 'needs-revalidation' ? 2 : 0) -
        (linkHealth?.state === 'dead' ? 5 : 0);
      return {
        ...item,
        compatibility: fit,
        ...(linkHealth
          ? {
              linkHealth: {
                state: linkHealth.state,
                checkedAt: linkHealth.checkedAt,
                finalUrl: linkHealth.finalUrl,
              },
            }
          : {}),
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const seen = new Set(),
    selected = [];
  for (const item of ranked) {
    const key = item.canonicalId || item.url || item.path;
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(item);
    if (selected.length === limit) break;
  }
  return { selected, incompatible };
}
