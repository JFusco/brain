import { registry, readCatalog } from '../../branch/official/registry.mjs';
import { fetchExcerpt } from '../../branch/lookup/fetch-excerpt.mjs';
import { httpsURL } from '../../leaf/url.mjs';
import { sha } from '../../leaf/hash.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';
import { noSymlinks, writeJSON } from '../../leaf/fs-safe.mjs';
import { readJSON } from '../../leaf/json.mjs';

const file = (run, url, checkedAt) =>
  at('.state/slack/references/' + run.id + '/' + sha(JSON.stringify([url, checkedAt])) + '.json');
export function referenceReceipt(run, url, checkedAt) {
  const path = file(run, url, checkedAt);
  noSymlinks(ROOT, path);
  return readJSON(path, null);
}
function registeredPage(href) {
  const url = httpsURL(href);
  if (!url) throw new Error('Official reference must be an HTTPS page');
  const reg = registry();
  const canonical = new URL(url);
  canonical.hash = '';
  for (const spec of reg.sources) {
    if (
      !spec.allowedHosts?.includes(url.hostname) &&
      !spec.repository &&
      spec.url !== canonical.href
    )
      continue;
    if (spec.repository && !['github.com', 'raw.githubusercontent.com'].includes(url.hostname))
      continue;
    const doc = readCatalog(spec.id);
    const item = [...doc.pages, ...doc.docs, ...doc.skills].find(p => p.url === canonical.href);
    if (item) return { ...item, source: spec.id };
    if (
      canonical.href === spec.url ||
      (spec.allowedHosts?.includes(url.hostname) &&
        spec.includePrefixes?.some(prefix => url.pathname.startsWith(prefix)) &&
        !spec.excludePrefixes?.some(prefix => url.pathname.startsWith(prefix)))
    )
      return { url: canonical.href, source: spec.id };
  }
  if (reg.pointers.some(p => p.url === canonical.href)) return { url: canonical.href };
  throw new Error('Official page outside registered coverage; use the source registration process');
}
export async function researchReference(run, { url, query }) {
  if (
    run.trigger !== 'scheduled-agent' ||
    run.mode ||
    typeof query !== 'string' ||
    !query.trim() ||
    query.length > 500
  )
    throw new Error('Provide a focused reference question in a scheduled claim');
  const item = registeredPage(url);
  // Use the run identity in the excerpt cache key so an earlier run's retrieval
  // cannot establish freshness for this research pass.
  const result = await fetchExcerpt({ ...item, sourceRevision: run.id }, query);
  if (!result.excerpt?.trim() || Date.parse(result.fetchedAt) < Date.parse(run.startedAt))
    throw new Error('Current primary evidence unavailable');
  const receipt = {
    reference: url,
    checkedAt: result.fetchedAt,
    contentSha256: result.contentSha256,
  };
  writeJSON(file(run, url, receipt.checkedAt), receipt, 0o600);
  return { ...receipt, excerpt: result.excerpt };
}
