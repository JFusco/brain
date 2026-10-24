import { sha } from '../../leaf/hash.mjs';
import { parseJSON } from '../../leaf/json.mjs';
import { onHosts } from '../../leaf/url.mjs';
import { SOURCE_ID, catalogPath, catalogHosts } from './registry.mjs';
import { skillPolicy } from './catalog-build.mjs';
import { officialSections } from './hubs.mjs';
import { registryProblems } from './validate-registry.mjs';

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
        return parseJSON(bytes);
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
      catalogs[id] = parseJSON(bytes);
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
