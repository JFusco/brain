import path from 'node:path';
import { splitFrontmatter, scalar, list, frontmatterProblems } from '../../leaf/frontmatter.mjs';
import { versionConstraint } from '../project/versions.mjs';

export const CURATED = /<!-- brain:curated:start -->[\s\S]*?<!-- brain:curated:end -->/;
export const isNote = relative =>
  /^knowledge\/.+\.md$/.test(relative) &&
  path.posix.basename(relative) !== 'INDEX.md' &&
  !relative.split('/').includes('_templates');

export function validateKnowledge(entries) {
  const problems = [];
  for (const { id, bytes } of entries) {
    const parsed = splitFrontmatter(bytes.toString());
    if (!parsed.raw) problems.push(`${id}: missing frontmatter`);
    if (!scalar(parsed.raw, 'title')) problems.push(`${id}: missing title`);
    problems.push(...frontmatterProblems(parsed.raw).map(p => `${id}: ${p}`));
    if (!id.endsWith('/INDEX.md') && !id.includes('/_templates/'))
      for (const key of ['domain', 'evidence_date', 'applicability', 'provenance'])
        if (!scalar(parsed.raw, key)) problems.push(`${id}: missing ${key}`);
    const status = scalar(parsed.raw, 'status');
    if (status && !['current', 'superseded', 'retired'].includes(status))
      problems.push(`${id}: invalid guidance status`);
    const format = scalar(parsed.raw, 'format');
    if (format && !['note', 'playbook'].includes(format))
      problems.push(`${id}: invalid guidance format`);
    for (const field of ['reviewed_at', 'review_after']) {
      const value = scalar(parsed.raw, field);
      if (
        value &&
        (!/^\d{4}-\d\d-\d\d$/.test(value) ||
          !Number.isFinite(Date.parse(value)) ||
          new Date(value).toISOString().slice(0, 10) !== value)
      )
        problems.push(`${id}: invalid ${field}`);
    }
    for (const value of list(parsed.raw, 'versions'))
      try {
        versionConstraint(value);
      } catch {
        problems.push(`${id}: invalid package-version constraint`);
      }
    const replacement = scalar(parsed.raw, 'superseded_by');
    if (
      status === 'superseded' &&
      (!/^knowledge\/.+\.md$/.test(replacement) ||
        replacement === id ||
        replacement.split('/').includes('..'))
    )
      problems.push(`${id}: superseded guidance requires a different knowledge page`);
  }
  return problems;
}
// Hubs link a domain's current notes. Pages are {path, raw} so check can use staged bytes.
export function curatedBlock(domain, pages) {
  const hub = `knowledge/${domain}/INDEX.md`,
    links = [];
  for (const page of pages) {
    if (
      !page.path.startsWith(`knowledge/${domain}/`) ||
      !isNote(page.path) ||
      ['superseded', 'retired'].includes(scalar(page.raw, 'status'))
    )
      continue;
    links.push(
      `- [${scalar(page.raw, 'title').replace(/[[\]]/g, '')}](${path.posix.relative(path.posix.dirname(hub), page.path)})`,
    );
  }
  return `<!-- brain:curated:start -->\n${links.length ? links.sort().join('\n') : 'No curated notes yet.'}\n<!-- brain:curated:end -->`;
}
