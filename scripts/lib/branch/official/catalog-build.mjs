import path from 'node:path';
import { splitFrontmatter, scalar } from '../../leaf/frontmatter.mjs';

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
