import fs from 'node:fs';
import path from 'node:path';
import { scalar } from '../../leaf/frontmatter.mjs';
import { registry, lock, readCatalog } from '../official/registry.mjs';
import { publishedGuidance } from '../guidance/published.mjs';

// Catalog links must be HTTPS without credentials on the default port; anything else throws.
export function webURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443'))
    throw new Error('Catalog URL must use HTTPS without credentials');
  return url;
}
export function lookupEntries(domain) {
  const result = [],
    active = lock(),
    reg = registry();
  for (const page of publishedGuidance()) {
    if (
      (domain && page.domain !== domain) ||
      ['superseded', 'retired'].includes(page.freshness.status)
    )
      continue;
    result.push({
      kind: 'curated-note',
      title: page.title,
      path: page.path,
      domain: page.domain,
      summary: page.body
        .replace(/^#+.*$/gm, '')
        .trim()
        .slice(0, 500),
      evidenceDate: scalar(page.raw, 'evidence_date'),
      applicability: scalar(page.raw, 'applicability'),
      versions: page.versions,
      freshness: page.freshness,
      sha256: page.sha256,
    });
  }
  for (const spec of reg.sources) {
    if (domain && !spec.domains.includes(domain)) continue;
    const entry = active.sources[spec.id];
    if (!entry) continue;
    const base = {
        source: spec.id,
        domains: spec.domains,
        sourceRevision: entry.revision,
        catalogFetchedAt: entry.fetchedAt,
      },
      doc = readCatalog(spec.id, entry);
    for (const page of doc.pages) {
      webURL(page.url);
      webURL(page.fetchUrl || page.url);
      result.push({ ...base, ...page, kind: 'official-page' });
    }
    for (const skill of doc.skills)
      result.push({
        ...base,
        kind: 'skill-reference',
        title: skill.declaredName || skill.name,
        summary: skill.description,
        url: skill.url,
        fetchUrl: skill.fetchUrl,
        gitBlobSha: skill.gitBlobSha,
        installable: skill.installable,
        applicability: skill.appliesTo,
      });
    for (const item of doc.docs)
      result.push({
        ...base,
        kind: 'official-reference',
        title: item.title,
        url: item.url,
        fetchUrl: item.fetchUrl,
        gitBlobSha: item.gitBlobSha,
      });
  }
  for (const pointer of reg.pointers) {
    if (domain && pointer.domain !== domain) continue;
    webURL(pointer.url);
    result.push({
      kind: 'official-pointer',
      title: pointer.domain + ' official documentation',
      domains: [pointer.domain],
      url: pointer.url,
      summary: pointer.reason,
      coverage: 'website pointer; contents not catalogued',
    });
  }
  return result;
}
export function installedEntries(context, domain) {
  const docs = context.installedDocs;
  if (!docs || (domain && domain !== 'nextjs')) return [];
  const entries = [];
  let visited = 0;
  function visit(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (++visited > 8000) throw new Error('Installed documentation exceeds its discovery bound');
      if (item.isSymbolicLink()) continue;
      const file = path.join(directory, item.name);
      if (item.isDirectory()) visit(file);
      else if (
        item.isFile() &&
        /\.(?:md|mdx)$/.test(item.name) &&
        fs.statSync(file).size <= 4 * 1024 * 1024
      )
        entries.push({
          kind: 'installed-documentation',
          source: 'installed:next',
          domain: 'nextjs',
          title: path
            .relative(docs.root, file)
            .replace(/\.(md|mdx)$/, '')
            .replace(/[-/]/g, ' '),
          path: file,
          versions: [`next@${docs.version.replace(/[-+].*$/, '')}`],
          installedVersion: docs.version,
        });
    }
  }
  visit(docs.root);
  return entries;
}
