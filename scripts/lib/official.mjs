import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  at,
  ROOT,
  config,
  json,
  readJSON,
  writeJSON,
  atomic,
  sha,
  now,
  safePath,
  noSymlinks,
  walk,
  log,
} from './core.mjs';
import { api, download, markdownResponse } from './network.mjs';
import { archive } from './archive.mjs';
import { assertClean } from './privacy.mjs';
import { fetchDocumentationCatalog, indexLimit } from './documentation.mjs';
import { staleGuidance, publishedGuidance, curatedBlock, CURATED } from './guidance.mjs';
const require = createRequire(import.meta.url);
const { splitFrontmatter, scalar } = require('../wiki/lib/frontmatter.cjs');

// official/ holds the registry, a slim lock and generated link catalogs; page bodies are fetched on demand.
export const registry = () => json(at('official/sources.json'));
export const lock = () =>
  readJSON(at('official/sources.lock.json'), { schemaVersion: 2, sources: {}, toolchain: {} });
const SOURCE_ID = /^[a-z0-9][a-z0-9-]*$/;
export function catalogPath(id) {
  if (!SOURCE_ID.test(id)) throw new Error('Invalid source ID');
  return `official/catalogs/${id}.json`;
}
export const catalogBytes = doc => Buffer.from(JSON.stringify(doc, null, 2) + '\n');
export function readCatalog(id, entry = lock().sources[id]) {
  const file = at(catalogPath(id));
  noSymlinks(at('official'), file);
  const bytes = fs.readFileSync(file);
  if (!entry || sha(bytes) !== entry.catalogSha256)
    throw new Error(`Catalog differs from its lock entry: ${id}`);
  const doc = JSON.parse(bytes);
  if (doc.source !== id || doc.revision !== entry.revision)
    throw new Error(`Invalid official catalog: ${id}`);
  return doc;
}
const selected = (source, name) =>
  source.paths.some(rule => rule.exact === name || (rule.prefix && name.startsWith(rule.prefix)));
export function skillPolicy(spec, folder) {
  return {
    installable:
      spec.installPolicy === 'portable' ||
      spec.installPolicy === 'sitecore-bundle' ||
      (spec.installPolicy === 'curated' && spec.installableSkills.includes(folder)),
    appliesTo:
      spec.id === 'vercel-plugin'
        ? { dependencies: [folder === 'nextjs' ? 'next' : 'react'] }
        : spec.appliesTo,
  };
}
function skillsOf(spec, files) {
  const skills = [],
    skillRoot = spec.skillRoot || null;
  for (const [name, bytes] of files) {
    if (!/(?:^|\/)SKILL\.md$/.test(name)) continue;
    if (
      skillRoot &&
      (!name.startsWith(skillRoot) || name.slice(skillRoot.length).split('/').length !== 2)
    )
      continue;
    const directory = path.posix.dirname(name),
      folder = path.posix.basename(directory),
      parsed = splitFrontmatter(bytes.toString());
    if (!scalar(parsed.raw, 'name') || !scalar(parsed.raw, 'description'))
      throw new Error(`Invalid skill frontmatter in ${spec.id}`);
    const { installable, appliesTo } = skillPolicy(spec, folder);
    skills.push({
      id: `${spec.id}/${folder}`,
      name: folder,
      declaredName: scalar(parsed.raw, 'name'),
      description: scalar(parsed.raw, 'description'),
      directory,
      installable,
      policy: spec.installPolicy,
      appliesTo,
      preferred: !!spec.preferred,
    });
  }
  return skills.sort((a, b) => a.id.localeCompare(b.id));
}
function relativeProblems(spec, files, skills) {
  const problems = [];
  const names = [...files.keys()];
  for (const [name, bytes] of files) {
    if (!/\.(?:md|mdx)$/i.test(name)) continue;
    const text = splitFrontmatter(bytes.toString()).body.replace(/```[\s\S]*?```/g, '');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      const href = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z][\w+.-]*:|#|\/)/i.test(href) || /[<>${}*]/.test(href)) continue;
      let target;
      try {
        target = path.posix.normalize(
          path.posix.join(path.posix.dirname(name), decodeURIComponent(href.split(/[?#]/)[0])),
        );
      } catch {
        continue;
      }
      if (
        target.startsWith('../') ||
        (!files.has(target) &&
          !files.has(target + '.md') &&
          !names.some(n => n.startsWith(target.replace(/\/$/, '') + '/')))
      )
        problems.push({ from: name, target });
    }
  }
  for (const skill of skills) {
    const required = problems.filter(p => p.from === skill.directory + '/SKILL.md');
    const warnings = problems.filter(
      p => p.from.startsWith(skill.directory + '/') && p.from !== skill.directory + '/SKILL.md',
    );
    if (warnings.length) skill.referenceWarnings = warnings.length;
    if (required.length) {
      skill.installable = false;
      skill.blockedReason = `${required.length} unresolved entry-point references`;
    }
  }
  return problems;
}
// Pure: sync and one-off conversions build identical catalogs from the same inputs.
export function buildCatalog(spec, { revision, origin, files, blobs, index, pages = [] }) {
  const doc = {
    schemaVersion: 1,
    source: spec.id,
    revision,
    origin,
    skills: [],
    docs: [],
    pages,
    referenceIssues: [],
  };
  if (files) {
    files = new Map([...files].sort(([a], [b]) => a.localeCompare(b)));
    const pinned = name => `${revision}/${spec.sourceBase || ''}${name}`,
      blob = name => `https://github.com/${spec.repository}/blob/${pinned(name)}`,
      raw = name => `https://raw.githubusercontent.com/${spec.repository}/${pinned(name)}`;
    // Archives can rewrite line endings, so blob IDs come from the repository tree, not archive bytes.
    const blobId = name => {
      const value = blobs?.get(name);
      if (!/^[0-9a-f]{40}$/.test(value || ''))
        throw new Error(`Missing Git blob for ${spec.id}/${name}`);
      return value;
    };
    doc.origin = `https://github.com/${spec.repository}/tree/${pinned('')}`;
    doc.skills = skillsOf(spec, files);
    doc.referenceIssues = relativeProblems(spec, files, doc.skills);
    for (const skill of doc.skills) {
      const name = skill.directory + '/SKILL.md';
      Object.assign(skill, { url: blob(name), fetchUrl: raw(name), gitBlobSha: blobId(name) });
    }
    doc.docs = [...files]
      .filter(
        ([name, bytes]) =>
          /\.(?:md|mdx|txt)$/.test(name) &&
          !/LICENSE|SKILL\.md$|llms(?:-full)?\.txt$/.test(name) &&
          bytes.length <= 2 * 1024 * 1024,
      )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, bytes]) => ({
        path: name,
        title: bytes.toString().match(/^#\s+(.+)$/m)?.[1] || name,
        url: blob(name),
        fetchUrl: raw(name),
        gitBlobSha: blobId(name),
      }));
  }
  if (index)
    for (const [, title, href] of index
      .toString()
      .matchAll(/\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)/g)) {
      let url;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      if (
        !url.username &&
        !url.password &&
        (!url.port || url.port === '443') &&
        spec.allowedHosts.includes(url.hostname)
      )
        doc.pages.push({ title, url: url.href, fetchUrl: url.href });
    }
  return doc;
}
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
function writeLock(reg, current) {
  const sources = {};
  for (const spec of reg.sources)
    if (current.sources[spec.id]) sources[spec.id] = current.sources[spec.id];
  for (const [id, entry] of Object.entries(current.sources)) sources[id] ??= entry;
  writeJSON(at('official/sources.lock.json'), {
    schemaVersion: 2,
    sources,
    toolchain: current.toolchain || {},
  });
}
// Hosted runs skip sources on hosts that refuse GitHub-hosted runners; a local sync refreshes them.
export const runnerBlocked = (spec, reg = registry()) =>
  catalogHosts(spec).some(host => (reg.runnerBlockedHosts || []).includes(host));
export async function sync({ ids = null, hosted = false } = {}) {
  const reg = registry(),
    specs = reg.sources.filter(s => !ids || ids.includes(s.id));
  if (ids?.some(id => !specs.some(s => s.id === id))) throw new Error('Unknown official source ID');
  const current = lock(),
    state = readJSON(at('.state/official-runs.json'));
  const changed = [],
    failed = [],
    unchanged = [],
    crawls = [],
    skipped = hosted ? specs.filter(s => runnerBlocked(s, reg)).map(s => s.id) : [];
  for (const spec of specs) {
    if (skipped.includes(spec.id)) continue;
    const previous = current.sources[spec.id],
      run = state[spec.id] || {},
      track = spec.track || 'rolling-url';
    let crawl;
    try {
      if (spec.kind === 'collection')
        crawl = { id: spec.id, indexesFetched: 0, maxIndexes: indexLimit(spec) };
      const doc = await fetchCatalog(spec, { onIndex: counts => Object.assign(crawl, counts) }),
        bytes = catalogBytes(doc);
      if (bytes.length > 1024 * 1024)
        throw new Error('Catalog exceeds 1 MiB; narrow the source before committing it');
      assertClean([{ id: catalogPath(spec.id), bytes }], { clients: false });
      const digest = sha(bytes);
      if (previous?.catalogSha256 === digest && previous.track === track) unchanged.push(spec.id);
      else {
        atomic(at(catalogPath(spec.id)), bytes);
        current.sources[spec.id] = {
          revision: doc.revision,
          fetchedAt: previous?.catalogSha256 === digest ? previous.fetchedAt : now(),
          track,
          catalogSha256: digest,
        };
        changed.push({ id: spec.id, from: previous?.revision || null, to: doc.revision });
        writeLock(reg, current);
      }
      state[spec.id] = {
        lastAttempt: now(),
        lastSuccess: now(),
        failures: 0,
        ...(crawl ? { crawl } : {}),
      };
      log('official-source', {
        id: spec.id,
        status: changed.some(c => c.id === spec.id) ? 'changed' : 'unchanged',
        ...(crawl ? { crawl } : {}),
      });
    } catch (error) {
      // A failed source keeps its last good catalog.
      const failures = (run.failures || 0) + 1;
      state[spec.id] = {
        ...run,
        lastAttempt: now(),
        failures,
        nextAttemptAt: new Date(
          Date.now() + Math.min(24, 2 ** Math.min(failures, 4)) * 3600000,
        ).toISOString(),
        error: error.message,
        ...(crawl ? { crawl } : {}),
      };
      delete state[spec.id].policySha256;
      failed.push({ id: spec.id, error: error.message });
      log('official-source', {
        id: spec.id,
        status: 'failed',
        reason: error.message,
        ...(crawl ? { crawl } : {}),
      });
    }
    if (crawl)
      crawls.push({ ...crawl, status: failed.some(f => f.id === spec.id) ? 'failed' : 'success' });
    writeJSON(at('.state/official-runs.json'), state, 0o600);
  }
  if (!ids)
    for (const id of Object.keys(current.sources))
      if (!reg.sources.some(s => s.id === id)) {
        changed.push({ id, from: current.sources[id].revision, to: null });
        delete current.sources[id];
        fs.rmSync(at(catalogPath(id)), { force: true });
        writeLock(reg, current);
      }
  generateHubs();
  return { changed, unchanged, failed, skipped, crawls };
}
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
function webURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === '443')
      ? url
      : null;
  } catch {
    return null;
  }
}
const onHosts = (value, hosts) => hosts.includes(webURL(value)?.hostname);
const catalogHosts = spec => [
  ...(spec.kind === 'repository' ? ['github.com', 'raw.githubusercontent.com'] : []),
  ...(webURL(spec.documentationBase) ? [webURL(spec.documentationBase).hostname] : []),
  ...(spec.allowedHosts || []),
];
function registryProblems(reg) {
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
            !webURL(spec.documentationBase)
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
      !webURL(pointer.url) ||
      typeof pointer.reason !== 'string' ||
      !pointer.reason.trim() ||
      Object.keys(pointer).length !== 3
    )
      issues.push('official/sources.json: invalid website pointer');
  if (Object.hasOwn(reg, 'runnerBlockedHosts')) {
    const blocked = reg.runnerBlockedHosts,
      used = new Set([
        ...reg.sources.filter(s => s && typeof s === 'object').flatMap(catalogHosts),
        ...reg.pointers.map(p => webURL(p?.url)?.hostname),
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
function catalogProblems(spec, entry, doc) {
  const label = `${spec.id}: catalog`,
    hosts = catalogHosts(spec),
    items = [...(doc?.skills || []), ...(doc?.docs || []), ...(doc?.pages || [])];
  if (
    doc?.schemaVersion !== 1 ||
    doc.source !== spec.id ||
    doc.revision !== entry.revision ||
    !['skills', 'docs', 'pages', 'referenceIssues'].every(key => Array.isArray(doc[key]))
  )
    return [`${label} structure or revision is invalid`];
  const issues = [];
  if (
    !onHosts(doc.origin, hosts) ||
    items.some(item => !onHosts(item.url, hosts) || !onHosts(item.fetchUrl ?? item.url, hosts))
  )
    issues.push(`${label} links leave the source's approved hosts`);
  if (items.some(item => item.gitBlobSha !== undefined && !/^[0-9a-f]{40}$/.test(item.gitBlobSha)))
    issues.push(`${label} has an invalid Git blob hash`);
  if (spec.kind !== 'repository' || spec.catalogOnly) {
    if (
      !doc.pages.length ||
      doc.pages.length > (spec.maxPages ?? 5000) ||
      doc.skills.length ||
      doc.docs.length
    )
      issues.push(`${label} page count is out of bounds`);
    return issues;
  }
  // Registry edits change what sync derives; a stale catalog must be refreshed, not trusted.
  const prefix = `https://github.com/${spec.repository}/blob/${entry.revision}/${spec.sourceBase || ''}`;
  const drift =
    doc.pages.length ||
    doc.skills.some(skill => {
      const policy = skillPolicy(spec, skill.name);
      return (
        skill.id !== `${spec.id}/${skill.name}` ||
        skill.policy !== spec.installPolicy ||
        skill.preferred !== !!spec.preferred ||
        skill.installable !== (policy.installable && !skill.blockedReason) ||
        JSON.stringify(skill.appliesTo) !== JSON.stringify(policy.appliesTo) ||
        skill.url !== `${prefix}${skill.directory}/SKILL.md`
      );
    }) ||
    doc.docs.some(item => item.url !== prefix + item.path);
  if (drift)
    issues.push(`${spec.id}: catalog does not match the registry; run official sync ${spec.id}`);
  return issues;
}
// Pure over a reader so check can validate staged blobs and the working tree alike.
export function officialProblems(read, names, { unexpected = 'warnings' } = {}) {
  const issues = [],
    warnings = [],
    parse = name => {
      const bytes = read(name);
      if (!bytes) {
        issues.push(`${name}: missing`);
        return null;
      }
      try {
        return JSON.parse(bytes);
      } catch {
        issues.push(`${name}: invalid JSON`);
        return null;
      }
    };
  const reg = parse('official/sources.json'),
    active = parse('official/sources.lock.json');
  if (!reg || !active) return { issues, warnings };
  issues.push(...registryProblems(reg));
  if (issues.length) return { issues, warnings };
  if (
    active.schemaVersion !== 2 ||
    !active.sources ||
    typeof active.sources !== 'object' ||
    !/^\d+\.\d+\.\d+$/.test(active.toolchain?.gitleaks?.version || '')
  )
    return {
      issues: [
        'official/sources.lock.json: schemaVersion 2 with sources and the pinned scanner is required',
      ],
      warnings,
    };
  const catalogs = {};
  for (const [id, entry] of Object.entries(active.sources)) {
    const spec = reg.sources.find(s => s.id === id);
    if (!spec) {
      issues.push(`${id}: lock entry has no registered source`);
      continue;
    }
    if (
      Object.keys(entry).sort().join() !== 'catalogSha256,fetchedAt,revision,track' ||
      !Number.isFinite(Date.parse(entry.fetchedAt)) ||
      !(spec.kind === 'repository' ? /^[0-9a-f]{40}$/ : /^[0-9a-f]{64}$/).test(entry.revision)
    ) {
      issues.push(`${id}: invalid lock entry`);
      continue;
    }
    if (entry.track !== (spec.track || 'rolling-url'))
      issues.push(`${id}: lock tracking differs from the registry; run official sync ${id}`);
    const bytes = read(catalogPath(id));
    if (!bytes) {
      issues.push(`${id}: catalog is missing`);
      continue;
    }
    if (sha(bytes) !== entry.catalogSha256) {
      issues.push(`${id}: catalog differs from its lock entry`);
      continue;
    }
    try {
      catalogs[id] = JSON.parse(bytes);
    } catch {
      issues.push(`${id}: catalog is invalid JSON`);
      continue;
    }
    issues.push(...catalogProblems(spec, entry, catalogs[id]));
  }
  for (const spec of reg.sources)
    if (!active.sources[spec.id])
      warnings.push(`${spec.id}: not yet catalogued; run official sync ${spec.id}`);
  const expected = new Set([
    'official/sources.json',
    'official/sources.lock.json',
    ...Object.keys(active.sources)
      .filter(id => SOURCE_ID.test(id))
      .map(catalogPath),
  ]);
  // Name the leftovers (for example pre-catalog snapshots) so the warning says exactly what to remove.
  const extra = names.filter(name => !expected.has(name)),
    paths = [
      ...new Set(
        extra.map(name =>
          name.startsWith('official/catalogs/') ? name : name.split('/').slice(0, 2).join('/'),
        ),
      ),
    ].sort();
  if (extra.length)
    (unexpected === 'issues' ? issues : warnings).push(
      `${extra.length} unexpected files under official/ (${paths.join(', ')}); only the registry, lock and catalogs belong there${unexpected === 'issues' ? '' : `. Delete them with: rm -rf ${paths.join(' ')}`}`,
    );
  if (!issues.length)
    for (const [domain, section] of Object.entries(
      officialSections({ reg, active, catalog: id => catalogs[id] }),
    )) {
      const actual = read(`knowledge/${domain}/INDEX.md`)
        ?.toString()
        .match(/<!-- brain:official:start -->\n([\s\S]*?)<!-- brain:official:end -->/)?.[1];
      if (actual !== section) issues.push(`Stale official section: ${domain}; run curation hubs`);
    }
  return { issues, warnings };
}
export function checkOfficial() {
  const names = walk(at('official')).map(file =>
    path.relative(ROOT, file).split(path.sep).join('/'),
  );
  const { issues, warnings } = officialProblems(
    name => (fs.existsSync(at(name)) ? fs.readFileSync(at(name)) : null),
    names,
  );
  return { ok: !issues.length, issues, warnings };
}
