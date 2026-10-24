import { config } from '../platform/config.mjs';
import { httpsURL, onHosts } from '../../leaf/url.mjs';
import { indexLimit } from './documentation/limits.mjs';
import { SOURCE_ID, catalogHosts } from './registry.mjs';

const POLICIES = ['reference-only', 'portable', 'curated', 'sitecore-bundle'],
  TRACKS = ['default-branch', 'latest-release', 'pinned'],
  COMMON = [
    'id',
    'vendor',
    'domains',
    'kind',
    'license',
    'installPolicy',
    'preferred',
    'applicability',
  ];
// Registry keys are strict so a field sync would ignore cannot look like policy.
const FIELDS = {
  repository: [
    ...COMMON,
    'repository',
    'track',
    'revision',
    'sourceBase',
    'skillRoot',
    'paths',
    'appliesTo',
    'installableSkills',
    'catalogOnly',
    'documentationPrefix',
    'documentationBase',
    'documentationSuffix',
    'maxPages',
  ],
  url: [...COMMON, 'url', 'allowedHosts'],
  collection: [
    ...COMMON,
    'indexUrl',
    'indexFormat',
    'allowedHosts',
    'includePrefixes',
    'excludePrefixes',
    'maxPages',
    'maxIndexes',
    'fetchSuffix',
    'additionalPages',
  ],
};
export function registryProblems(reg) {
  const issues = [],
    domains = config().domains,
    ids = new Set();
  if (
    reg.schemaVersion !== 2 ||
    !Array.isArray(reg.sources) ||
    !Array.isArray(reg.pointers) ||
    Object.keys(reg).filter(key => key !== 'runnerBlockedHosts').length !== 3
  )
    return ['official/sources.json: schemaVersion 2 with sources and pointers is required'];
  for (const spec of reg.sources) {
    if (!SOURCE_ID.test(spec?.id) || ids.has(spec.id)) {
      issues.push('official/sources.json: invalid or duplicate source ID');
      continue;
    }
    ids.add(spec.id);
    const fail = reason => issues.push(`official/sources.json: ${spec.id}: ${reason}`);
    if (!FIELDS[spec.kind]) fail('unknown kind');
    else
      for (const key of Object.keys(spec))
        if (!FIELDS[spec.kind].includes(key)) fail(`unsupported field ${key}`);
    if (
      !Array.isArray(spec.domains) ||
      !spec.domains.length ||
      spec.domains.some(d => !domains.includes(d))
    )
      fail('unknown domain');
    if (typeof spec.license !== 'string' || !spec.license.trim()) fail('license is required');
    if (!POLICIES.includes(spec.installPolicy)) fail('unknown install policy');
    if (spec.kind === 'repository') {
      if (!/^[\w.-]+\/[\w.-]+$/.test(spec.repository || '')) fail('repository is required');
      if (
        !TRACKS.includes(spec.track) ||
        (spec.track === 'pinned' && !/^[0-9a-f]{40}$/.test(spec.revision || ''))
      )
        fail('invalid tracking policy');
      if (
        spec.catalogOnly
          ? typeof spec.documentationPrefix !== 'string' ||
            !spec.documentationPrefix ||
            !httpsURL(spec.documentationBase)
          : !Array.isArray(spec.paths) ||
            !spec.paths.length ||
            spec.paths.some(rule => typeof (rule.prefix ?? rule.exact) !== 'string')
      )
        fail('repository selection is incomplete');
      if (
        spec.documentationSuffix !== undefined &&
        (!spec.catalogOnly || !['.md', '.mdx'].includes(spec.documentationSuffix))
      )
        fail('documentationSuffix requires a catalog-only Markdown source');
      if (spec.installPolicy === 'curated' && !Array.isArray(spec.installableSkills))
        fail('curated sources list installable skills');
    }
    if (spec.kind === 'url' && !onHosts(spec.url, spec.allowedHosts || []))
      fail('url must be HTTPS on an allowed host');
    if (
      spec.kind === 'collection' &&
      (!onHosts(spec.indexUrl, spec.allowedHosts || []) || !Array.isArray(spec.includePrefixes))
    )
      fail('indexUrl must be HTTPS on an allowed host with include prefixes');
    if (spec.kind === 'collection') {
      if (spec.indexFormat && !['sitemap', 'html', 'markdown'].includes(spec.indexFormat))
        fail('unknown index format');
      if (
        spec.excludePrefixes !== undefined &&
        (!Array.isArray(spec.excludePrefixes) ||
          spec.excludePrefixes.some(
            prefix => typeof prefix !== 'string' || !prefix.startsWith('/'),
          ))
      )
        fail('excludePrefixes must list absolute URL path prefixes');
      try {
        indexLimit(spec);
      } catch (error) {
        fail(error.message);
      }
    }
  }
  for (const pointer of reg.pointers)
    if (
      !domains.includes(pointer?.domain) ||
      !httpsURL(pointer.url) ||
      typeof pointer.reason !== 'string' ||
      !pointer.reason.trim() ||
      Object.keys(pointer).length !== 3
    )
      issues.push('official/sources.json: invalid website pointer');
  if (Object.hasOwn(reg, 'runnerBlockedHosts')) {
    const blocked = reg.runnerBlockedHosts,
      used = new Set([
        ...reg.sources.filter(s => s && typeof s === 'object').flatMap(catalogHosts),
        ...reg.pointers.map(p => httpsURL(p?.url)?.hostname),
      ]);
    if (
      !Array.isArray(blocked) ||
      new Set(blocked).size !== blocked.length ||
      blocked.some(host => !used.has(host))
    )
      issues.push(
        'official/sources.json: runnerBlockedHosts must list unique hosts used by registered sources or pointers',
      );
  }
  return issues;
}
