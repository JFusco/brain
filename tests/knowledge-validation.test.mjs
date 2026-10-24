import assert from 'node:assert/strict';
import test from 'node:test';
import { curatedBlock, validateKnowledge } from '../scripts/lib/branch/guidance/knowledge.mjs';
import { guidanceState } from '../scripts/lib/branch/guidance/freshness.mjs';

const note = fields =>
  `---\n${Object.entries(fields)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\n\nBody.\n`;
const valid = {
  title: 'Cache tags',
  domain: 'nextjs',
  evidence_date: '2026-10-01',
  applicability: 'Next.js 16',
  provenance: 'nextjs-docs@0123456789abcdef',
};
const problems = (fields, id = 'knowledge/nextjs/cache-tags.md') =>
  validateKnowledge([{ id, bytes: Buffer.from(note(fields)) }]);

test('a complete note passes', () => {
  assert.deepEqual(problems(valid), []);
});

test('notes require domain, evidence, applicability and provenance', () => {
  const { provenance, ...missing } = valid;
  assert.ok(provenance);
  assert.deepEqual(problems(missing), ['knowledge/nextjs/cache-tags.md: missing provenance']);
});

test('rejects invalid status, dates, versions and superseded targets', () => {
  assert.match(problems({ ...valid, status: 'draft' }).join(), /invalid guidance status/);
  assert.match(problems({ ...valid, review_after: '2026-02-30' }).join(), /invalid review_after/);
  assert.match(
    problems({ ...valid, versions: ['next@^16'] }).join(),
    /invalid package-version constraint/,
  );
  for (const target of ['', 'knowledge/nextjs/cache-tags.md', 'knowledge/../x.md']) {
    assert.match(
      problems({ ...valid, status: 'superseded', superseded_by: target }).join(),
      /superseded guidance requires a different knowledge page/,
    );
  }
});

test('hubs link only current notes in their own domain, sorted', () => {
  const page = (path, title, status) => ({
    path,
    raw: `title: ${title}${status ? `\nstatus: ${status}` : ''}`,
  });
  const block = curatedBlock('react', [
    page('knowledge/react/b.md', 'B [x]'),
    page('knowledge/react/a.md', 'A'),
    page('knowledge/react/old.md', 'Old', 'retired'),
    page('knowledge/react/INDEX.md', 'Hub'),
    page('knowledge/nextjs/c.md', 'C'),
  ]);
  assert.equal(
    block,
    '<!-- brain:curated:start -->\n- [A](a.md)\n- [B x](b.md)\n<!-- brain:curated:end -->',
  );
  assert.match(curatedBlock('react', []), /No curated notes yet\./);
});

test('freshness flags changed or missing cited sources and elapsed review dates', () => {
  const raw = (provenance, reviewAfter) =>
    `status: current\nprovenance: ${provenance}\nreview_after: ${reviewAfter}`;
  const active = { sources: { docs: { revision: 'abcdef0123456789' } } };
  assert.equal(guidanceState(raw('docs@abcdef012345', '2999-01-01'), active).status, 'current');
  const changed = guidanceState(raw('docs@ffffff012345', '2999-01-01'), active);
  assert.deepEqual(
    changed.reasons.map(r => r.kind),
    ['source-changed'],
  );
  const gone = guidanceState(raw('gone@abcdef012345', '2000-01-01'), active);
  assert.deepEqual(
    gone.reasons.map(r => r.kind),
    ['source-unavailable', 'review-due'],
  );
  assert.equal(guidanceState('status: retired', active).status, 'retired');
});
