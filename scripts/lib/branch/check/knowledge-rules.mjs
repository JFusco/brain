import { config } from '../platform/config.mjs';
import { splitFrontmatter, scalar } from '../../leaf/frontmatter.mjs';
import { CURATED, curatedBlock, isNote, validateKnowledge } from '../guidance/knowledge.mjs';

// Note metadata, superseded targets, and hubs that link exactly the current notes these bytes publish.
export function knowledgeProblems(entries) {
  const issues = [];
  issues.push(
    ...validateKnowledge(
      entries.filter(
        e =>
          e.id.startsWith('knowledge/') && e.id.endsWith('.md') && !e.id.includes('/_templates/'),
      ),
    ),
  );
  const notes = entries
    .filter(e => isNote(e.id))
    .map(e => ({
      path: e.id,
      raw: splitFrontmatter(e.bytes.toString()).raw,
      valid: !validateKnowledge([e]).length,
    }));
  for (const note of notes)
    if (scalar(note.raw, 'status') === 'superseded') {
      const target = scalar(note.raw, 'superseded_by');
      if (!notes.some(candidate => candidate.path === target))
        issues.push(`${note.path}: superseded replacement has no published content`);
    }
  // Hubs must link exactly the current notes these bytes would publish.
  for (const domain of config().domains) {
    const hub = `knowledge/${domain}/INDEX.md`,
      block = entries
        .find(e => e.id === hub)
        ?.bytes.toString()
        .match(CURATED)?.[0];
    if (
      block &&
      block !==
        curatedBlock(
          domain,
          notes.filter(note => note.valid),
        )
    )
      issues.push(`${hub}: curated links are out of date; run curation hubs`);
  }
  return issues;
}
