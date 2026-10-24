import fs from 'node:fs';
import path from 'node:path';
import { noSymlinks, walk } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { splitFrontmatter, scalar, list } from '../../leaf/frontmatter.mjs';
import { isNote, validateKnowledge } from './knowledge.mjs';
import { guidanceState } from './freshness.mjs';

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
