import { config } from '../platform/config.mjs';
import { archive } from '../platform/archive.mjs';
import { safePath } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { download, markdownResponse } from '../platform/network/download.mjs';
import { api } from '../platform/network/github.mjs';
import { fetchDocumentationCatalog } from './documentation/fetch.mjs';
import { SOURCE_ID } from './registry.mjs';
import { buildCatalog } from './catalog-build.mjs';

const selected = (source, name) =>
  source.paths.some(rule => rule.exact === name || (rule.prefix && name.startsWith(rule.prefix)));

async function resolve(spec) {
  if (spec.track === 'pinned') {
    if (!/^[0-9a-f]{40}$/.test(spec.revision || ''))
      throw new Error('Pinned source requires a full commit');
    return spec.revision;
  }
  let ref;
  if (spec.track === 'latest-release') {
    const release = await api(`repos/${spec.repository}/releases/latest`);
    if (release.prerelease || release.draft) throw new Error('No stable release');
    ref = release.tag_name;
  } else if (spec.track === 'default-branch') {
    const metadata = await api(`repos/${spec.repository}`);
    if (metadata.full_name.toLowerCase() !== spec.repository.toLowerCase())
      throw new Error('Repository identity changed');
    ref = metadata.default_branch;
  } else throw new Error('Unknown source tracking policy');
  const commit = await api(`repos/${spec.repository}/commits/${encodeURIComponent(ref)}`);
  if (!/^[0-9a-f]{40}$/.test(commit.sha)) throw new Error('Could not resolve immutable commit');
  return commit.sha;
}
// Upstream bytes stay in memory; only the catalog is written.
export async function fetchCatalog(spec, { onIndex } = {}) {
  if (!SOURCE_ID.test(spec.id)) throw new Error('Invalid source ID');
  if (spec.kind === 'repository' && spec.catalogOnly) {
    const revision = await resolve(spec);
    return buildCatalog(spec, { revision, ...(await fetchDocumentationCatalog(spec, revision)) });
  }
  if (spec.kind === 'collection')
    return buildCatalog(spec, await fetchDocumentationCatalog(spec, undefined, { onIndex }));
  if (spec.kind === 'repository') {
    const revision = await resolve(spec),
      base = spec.sourceBase || '';
    const response = await download(
      `https://codeload.github.com/${spec.repository}/tar.gz/${revision}`,
      { hosts: ['codeload.github.com'], maxBytes: config().network.maxDownloadBytes },
    );
    const files = new Map(
      [
        ...archive(response.bytes, {
          select: name => name.startsWith(base) && selected(spec, name.slice(base.length)),
        }),
      ].map(([name, bytes]) => [safePath(name.slice(base.length)), bytes]),
    );
    for (const rule of spec.paths) {
      if (rule.required === false) continue;
      if (rule.prefix && ![...files.keys()].some(n => n.startsWith(rule.prefix)))
        throw new Error(`Approved upstream path disappeared: ${spec.id}/${rule.prefix}`);
    }
    const tree = await api(`repos/${spec.repository}/git/trees/${revision}?recursive=1`);
    if (tree.truncated)
      throw new Error('Official repository tree is truncated; refusing a partial catalog');
    const blobs = new Map(
      tree.tree
        .filter(file => file.type === 'blob' && file.path.startsWith(base))
        .map(file => [file.path.slice(base.length), file.sha]),
    );
    return buildCatalog(spec, { revision, files, blobs });
  }
  if (spec.kind === 'url') {
    const response = await download(spec.url, {
      hosts: spec.allowedHosts,
      maxBytes: config().network.maxDownloadBytes,
      headers: { accept: 'text/markdown, text/plain;q=0.9' },
    });
    markdownResponse(response);
    return buildCatalog(spec, {
      revision: sha(response.bytes),
      origin: response.url,
      index: response.bytes,
    });
  }
  throw new Error('Unsupported source kind');
}
