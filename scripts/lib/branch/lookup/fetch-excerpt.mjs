import { webURL } from './sources.mjs';
import { config } from '../platform/config.mjs';
import { sha, gitBlob } from '../../leaf/hash.mjs';
import { at } from '../../leaf/paths.mjs';
import { now } from '../../leaf/time.mjs';
import { registry } from '../official/registry.mjs';
import { download } from '../platform/network/download.mjs';
import { assertClean } from '../privacy/scanner.mjs';
import { storeExcerpt, readExcerpt, cleanExcerptCache } from '../cache/excerpts.mjs';
import { excerpt } from './excerpt.mjs';

export async function fetchExcerpt(item, query) {
  const target = item.fetchUrl || item.url,
    url = webURL(target),
    canonical = webURL(item.url);
  const source = registry().sources.find(spec => spec.id === item.source);
  const allowed = new Set(source?.allowedHosts || []);
  allowed.add(canonical.hostname);
  if (source?.repository) allowed.add('raw.githubusercontent.com');
  if (!allowed.has(url.hostname)) throw new Error('Fetch target is outside this source');
  const key = sha(
      JSON.stringify({
        schemaVersion: 2,
        excerptVersion: 2,
        target,
        query,
        revision: item.sourceRevision,
      }),
    ),
    file = at(`.state/lookup/${key}.json`),
    cached = readExcerpt(file);
  if (
    cached &&
    Date.now() - Date.parse(cached.fetchedAt) < (config().lookup?.cacheHours ?? 24) * 3600000
  ) {
    assertClean([{ id: 'lookup-excerpt', bytes: Buffer.from(cached.excerpt) }], { clients: false });
    return { ...cached, cache: 'hit' };
  }
  const response = await download(target, {
    hosts: [...allowed],
    maxBytes: 4 * 1024 * 1024,
    headers: { accept: 'text/markdown, text/plain;q=0.9, text/html;q=0.5' },
  });
  const text = response.bytes.toString();
  if (
    !text.trim() ||
    text.includes('\0') ||
    /just a moment|sign in to continue|cf-chl-/i.test(text.slice(0, 3000))
  )
    throw new Error('Documentation page is unavailable or challenged');
  if (item.gitBlobSha && gitBlob(response.bytes) !== item.gitBlobSha)
    throw new Error('Fetched documentation differs from the pinned repository blob');
  const fragment = excerpt(
    text,
    query,
    String(response.headers['content-type'] || '').includes('text/html'),
  );
  assertClean([{ id: 'lookup-excerpt', bytes: Buffer.from(fragment) }], { clients: false });
  const receipt = {
    schemaVersion: 2,
    url: response.url,
    fetchedAt: now(),
    contentSha256: sha(response.bytes),
    excerpt: fragment,
    bodyStored: false,
  };
  storeExcerpt(file, receipt);
  cleanExcerptCache({ yes: true });
  return { ...receipt, cache: 'miss' };
}
