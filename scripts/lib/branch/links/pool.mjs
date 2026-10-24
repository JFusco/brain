import fs from 'node:fs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { readExcerpt } from '../cache/excerpts.mjs';
import { publishedGuidance } from '../guidance/published.mjs';
import { lookupEntries } from '../lookup/sources.mjs';

// Catalogued and pointer links on their sources' hosts. Priority 2: cited by a current note;
// 1: among the most recently fetched excerpts; 0: otherwise.
export function linkPool(specs, { skipHosts = [] } = {}) {
  const all = new Map(),
    aliases = new Map();
  for (const item of lookupEntries())
    if (item.url) {
      const spec = specs.find(spec => spec.id === item.source),
        url = new URL(item.url);
      const hosts =
        spec?.kind === 'repository'
          ? [
              'github.com',
              ...(spec.allowedHosts || []),
              ...(spec.documentationBase ? [new URL(spec.documentationBase).hostname] : []),
            ]
          : spec?.allowedHosts || [url.hostname];
      // Skipped hosts leave the pool, so their earlier records turn inactive rather than staying as warnings.
      if (
        url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        (!url.port || url.port === '443') &&
        hosts.includes(url.hostname) &&
        !skipHosts.includes(url.hostname) &&
        !all.has(url.href)
      )
        all.set(url.href, {
          url: url.href,
          source: item.source || 'website-pointers',
          hosts,
          priority: 0,
        });
      if (item.fetchUrl) aliases.set(item.fetchUrl, url.href);
    }
  for (const page of publishedGuidance())
    if (!['superseded', 'retired'].includes(page.freshness.status))
      for (const match of page.body.matchAll(/\]\((https:\/\/[^\s)]+)\)/g)) {
        const item = all.get(match[1]);
        if (item) item.priority = 2;
      }
  const cache = readJSON(at('.state/lookup-cache.json'), { files: {} });
  for (const [name] of Object.entries(cache.files)
    .sort((a, b) => b[1].fetchedAt.localeCompare(a[1].fetchedAt))
    .slice(0, 20))
    if (/^[a-f0-9]{64}\.json$/.test(name) && fs.existsSync(at('.state/lookup/' + name)))
      try {
        const receipt = readExcerpt(at('.state/lookup/' + name)),
          item = all.get(receipt.url) || all.get(aliases.get(receipt.url));
        if (item) item.priority = Math.max(item.priority, 1);
      } catch {
        /* unreadable cached receipt: no priority boost */
      }
  return all;
}
