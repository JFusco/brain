import fs from 'node:fs';
import { atomic } from '../../leaf/fs-safe.mjs';
import { at } from '../../leaf/paths.mjs';
import { staleGuidance } from '../curation/stale.mjs';
import { publishedGuidance } from '../../branch/guidance/published.mjs';
import { curatedBlock, CURATED } from '../../branch/guidance/knowledge.mjs';
import { officialSections } from '../../branch/official/hubs.mjs';

export function generateHubs() {
  const pages = publishedGuidance(),
    changed = [];
  for (const [domain, section] of Object.entries(officialSections())) {
    const file = at(`knowledge/${domain}/INDEX.md`);
    const text = fs.readFileSync(file, 'utf8');
    if (
      !text.includes('<!-- brain:official:start -->') ||
      !text.includes('<!-- brain:official:end -->')
    )
      throw new Error('Domain hub is missing managed markers');
    let result = text.replace(
      /<!-- brain:official:start -->[\s\S]*?<!-- brain:official:end -->/,
      `<!-- brain:official:start -->\n${section}<!-- brain:official:end -->`,
    );
    if (CURATED.test(result)) result = result.replace(CURATED, curatedBlock(domain, pages));
    if (result !== text) {
      atomic(file, result);
      changed.push(`knowledge/${domain}/INDEX.md`);
    }
  }
  staleGuidance({ limit: 100, write: true });
  return changed;
}
