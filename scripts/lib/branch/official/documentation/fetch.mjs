import { documentationBytes } from '../../../leaf/documentation-bytes.mjs';
import { config } from '../../platform/config.mjs';
import { download, markdownResponse } from '../../platform/network/download.mjs';
import { api } from '../../platform/network/github.mjs';
import { htmlLinks, markdownLinks, sitemapLinks } from './index-links.mjs';
import { bounded, indexLimit, pageDigest } from './limits.mjs';
import { pageCollector } from './page-filter.mjs';
import { repositoryCatalog } from './repository-catalog.mjs';

// Publishers can reject index requests that omit their supported media types.
const ACCEPT = {
  sitemap: 'application/xml, text/xml;q=0.9, text/plain;q=0.8',
  html: 'text/html',
};

export async function fetchDocumentationCatalog(spec, revision, { onIndex = () => {} } = {}) {
  if (spec.kind === 'repository') {
    const tree = await api(`repos/${spec.repository}/git/trees/${revision}?recursive=1`);
    if (tree.truncated)
      throw new Error('Official repository tree is truncated; refusing a partial catalog');
    return repositoryCatalog(spec, tree, revision);
  }
  const { pages, add } = pageCollector(spec);
  const queue = [spec.indexUrl];
  const seen = new Set();
  const maxIndexes = indexLimit(spec);
  let indexesFetched = 0;
  while (queue.length) {
    const input = queue.shift();
    if (seen.has(input)) continue;
    if (seen.size >= maxIndexes)
      throw new Error(
        `Sitemap index bound exceeded (${indexesFetched}/${maxIndexes} downloaded); refusing a partial catalog`,
      );
    seen.add(input);
    const response = await download(input, {
      hosts: spec.allowedHosts,
      maxBytes: config().network.maxDownloadBytes,
      headers: {
        accept: Object.hasOwn(ACCEPT, spec.indexFormat ?? '')
          ? ACCEPT[spec.indexFormat]
          : 'text/markdown, text/plain;q=0.9',
      },
    });
    onIndex({ indexesFetched: ++indexesFetched, maxIndexes });
    const bytes = documentationBytes(response, input, config().network.maxExpandedBytes);
    let links;
    if (spec.indexFormat === 'html') {
      const index = bytes.toString('utf8');
      if (
        !String(response.headers['content-type']).includes('text/html') ||
        index.includes('\0') ||
        !index.trim()
      )
        throw new Error('Expected an HTML documentation index');
      links = htmlLinks(index, response.url);
    } else if (spec.indexFormat === 'sitemap') {
      const found = sitemapLinks(markdownResponse({ ...response, bytes }), spec.allowedHosts);
      queue.push(...found.indexes);
      links = found.links;
    } else links = markdownLinks(markdownResponse({ ...response, bytes }));
    for (const link of links) add(link.href, link.title, response.url);
  }
  // Additional pages restore what an index omits; they never stand in for an index with no matches.
  if (!pages.size)
    throw new Error(
      'Official index contains no matching documentation links before additional pages',
    );
  for (const page of spec.additionalPages || []) add(page.url, page.title, spec.indexUrl, true);
  const sorted = bounded(spec, [...pages.values()]);
  return {
    pages: sorted,
    origin: spec.indexUrl,
    revision: pageDigest(spec, spec.indexUrl, sorted),
  };
}
