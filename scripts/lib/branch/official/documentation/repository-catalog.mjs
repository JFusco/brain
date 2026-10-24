import { bounded } from './limits.mjs';

// Markdown files under the documentation prefix of a pinned repository tree.
export function repositoryCatalog(spec, tree, revision) {
  const prefix = spec.documentationPrefix;
  if (typeof prefix !== 'string' || !prefix || !spec.documentationBase)
    throw new Error('Repository catalog requires documentationPrefix and documentationBase');
  const pages = tree.tree
    .filter(
      file =>
        file.type === 'blob' &&
        /^100(?:644|755)$/.test(file.mode) &&
        file.path.startsWith(prefix) &&
        /\.(?:md|mdx)$/.test(file.path),
    )
    .map(file => {
      const relative = file.path
        .slice(prefix.length)
        .replace(/\.(?:md|mdx)$/, '')
        .replace(/(?:^|\/)index$/, '');
      return {
        title: relative.split('/').filter(Boolean).join(' / ').replace(/-/g, ' ') || spec.vendor,
        url: new URL(relative + (spec.documentationSuffix || ''), spec.documentationBase).href,
        fetchUrl: `https://raw.githubusercontent.com/${spec.repository}/${revision}/${file.path}`,
        gitBlobSha: file.sha,
      };
    });
  return {
    pages: bounded(spec, pages),
    origin: `https://github.com/${spec.repository}/tree/${revision}/${prefix}`,
  };
}
