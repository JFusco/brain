import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { at, ROOT, config, readJSON, sha, noSymlinks, walk, writeJSON, now } from './core.mjs';
import { versionConstraint } from './project-context.mjs';
const require = createRequire(import.meta.url);
const {
  splitFrontmatter,
  scalar,
  list,
  frontmatterProblems,
} = require('../wiki/lib/frontmatter.cjs');

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

export function guidanceState(
  raw,
  active = readJSON(at('official/sources.lock.json'), { sources: {} }),
) {
  const status = scalar(raw, 'status') || 'current',
    reasons = [];
  if (status !== 'current')
    return { status, reasons, supersededBy: scalar(raw, 'superseded_by') || null };
  for (const match of scalar(raw, 'provenance').matchAll(
    /\b([a-z0-9][a-z0-9-]+)@([a-f0-9]{12,64})(?=$|[^a-f0-9])/g,
  )) {
    const current = active.sources[match[1]];
    if (!current) reasons.push({ kind: 'source-unavailable', source: match[1] });
    else if (!current.revision.startsWith(match[2]))
      reasons.push({
        kind: 'source-changed',
        source: match[1],
        cited: match[2],
        current: current.revision,
      });
  }
  const reviewed = scalar(raw, 'reviewed_at') || scalar(raw, 'evidence_date');
  const explicit = scalar(raw, 'review_after');
  const due = explicit
    ? Date.parse(explicit)
    : Date.parse(reviewed) + (config().curation?.reviewDays ?? 30) * 86400000;
  if (!Number.isFinite(due)) reasons.push({ kind: 'review-date-unknown' });
  else if (due <= Date.now())
    reasons.push({ kind: 'review-due', dueAt: new Date(due).toISOString() });
  return {
    status: reasons.length ? 'needs-revalidation' : 'current',
    reasons,
    reviewedAt: reviewed || null,
    reviewDueAt: Number.isFinite(due) ? new Date(due).toISOString() : null,
  };
}

// Every merged note is published; Git history is the publication record.
export function publishedGuidance() {
  const active = readJSON(at('official/sources.lock.json'), { sources: {} }),
    pages = [];
  for (const file of walk(at('knowledge'), { file: f => f.endsWith('.md') })) {
    const relative = path.relative(ROOT, file).split(path.sep).join('/');
    if (!isNote(relative)) continue;
    noSymlinks(ROOT, file);
    const bytes = fs.readFileSync(file);
    // Invalid notes stay out of navigation; check reports them.
    if (validateKnowledge([{ id: relative, bytes }]).length) continue;
    const parsed = splitFrontmatter(bytes.toString());
    pages.push({
      path: relative,
      title: scalar(parsed.raw, 'title'),
      domain: scalar(parsed.raw, 'domain'),
      versions: list(parsed.raw, 'versions'),
      freshness: guidanceState(parsed.raw, active),
      raw: parsed.raw,
      body: parsed.body,
      sha256: sha(bytes),
    });
  }
  return pages;
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

export function staleGuidance({ limit = 12, write = false } = {}) {
  limit = Number(limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw new Error('Guidance limit must be between 1 and 100');
  const pages = publishedGuidance()
    .filter(page => page.freshness.status === 'needs-revalidation')
    .map(({ path, title, domain, sha256, freshness }) => ({
      path,
      title,
      domain,
      sha256,
      ...freshness,
    }));
  pages.sort(
    (a, b) =>
      Number(b.reasons.some(r => r.kind === 'source-changed')) -
        Number(a.reasons.some(r => r.kind === 'source-changed')) ||
      (a.reviewDueAt || '').localeCompare(b.reviewDueAt || '') ||
      a.path.localeCompare(b.path),
  );
  const result = {
    generatedAt: now(),
    total: pages.length,
    pages: pages.slice(0, limit),
    notice:
      'A changed source or elapsed review date requires claim verification, not automatic replacement of provenance or advice.',
  };
  if (write) writeJSON(at('.state/notes-needing-review.json'), result, 0o600);
  return result;
}
