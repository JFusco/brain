import path from 'node:path';
import { config } from '../platform/config.mjs';
import { registry, lock, readCatalog } from './registry.mjs';

export function officialSections({
  reg = registry(),
  active = lock(),
  catalog = readCatalog,
} = {}) {
  const sections = {};
  for (const domain of config().domains) {
    const lines = ['## Official sources', ''],
      hub = `knowledge/${domain}/INDEX.md`;
    for (const spec of reg.sources.filter(s => s.domains.includes(domain))) {
      const entry = active.sources[spec.id];
      if (!entry) {
        lines.push(
          `- ${spec.id}: not yet catalogued; see [upstream](${spec.repository ? 'https://github.com/' + spec.repository : spec.url || spec.indexUrl}).`,
        );
        continue;
      }
      const doc = catalog(spec.id, entry);
      const coverage = doc.pages.length
        ? `link catalog of ${doc.pages.length} pages`
        : `${doc.skills.length} skills and ${doc.docs.length} docs at a pinned commit`;
      lines.push(
        `- **${spec.id}** — ${coverage}; ${entry.track}; revision \`${entry.revision}\`; fetched ${entry.fetchedAt?.slice(0, 10) || 'unknown'}.`,
      );
      const sharedPlugin = spec.id === 'vercel-plugin' && ['react', 'nextjs'].includes(domain);
      if (sharedPlugin)
        lines.push(
          `  - [Complete Vercel plugin catalog](${path.posix.relative(path.posix.dirname(hub), 'knowledge/vercel/INDEX.md')}).`,
        );
      const visibleSkills = sharedPlugin
        ? doc.skills.filter(skill => domain === 'react' && skill.name === 'react-best-practices')
        : doc.skills;
      for (const skill of visibleSkills)
        lines.push(
          `  - [${skill.name}](${skill.url})${skill.installable ? '' : ' — reference only'}.`,
        );
      if (!doc.skills.length || doc.docs.some(d => d.path.startsWith('docs/')))
        for (const item of doc.docs.slice(0, 8)) lines.push(`  - [${item.path}](${item.url}).`);
      if (doc.pages.length)
        lines.push(
          `  - [Catalog source](${doc.origin}); search it with \`lookup --domain ${domain}\`.`,
        );
    }
    for (const pointer of reg.pointers.filter(p => p.domain === domain))
      lines.push(`- [Official website](${pointer.url}) — pointer only: ${pointer.reason}`);
    sections[domain] = lines.join('\n') + '\n';
  }
  return sections;
}
