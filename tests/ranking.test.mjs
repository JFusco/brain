import assert from 'node:assert/strict';
import test from 'node:test';
import { sha } from '../scripts/lib/leaf/hash.mjs';
import { rankEntries } from '../scripts/lib/branch/search/rank.mjs';
import { tokens } from '../scripts/lib/branch/search/tokens.mjs';
import { connectingPath } from '../scripts/lib/visual-brain/retrieval.mjs';

const target = { dependencies: { next: { version: '16.1.0' } } };

test('tokens normalize Next.js, drop stop words and dedupe', () => {
  assert.deepEqual(tokens('How to use the Next.js cache with nextjs CACHE'), ['nextjs', 'cache']);
});

test('ranking excludes incompatible entries and prefers installed docs and version matches', () => {
  const entries = [
    { title: 'Cache guide', kind: 'curated-note', path: 'a' },
    { title: 'Cache API', kind: 'official-page', url: 'https://x.test/a', versions: ['next@16'] },
    { title: 'Cache old', kind: 'official-page', url: 'https://x.test/b', versions: ['next@15'] },
    { title: 'Cache local', kind: 'installed-documentation', path: 'b' },
    { title: 'Unrelated', kind: 'curated-note', path: 'c' },
  ];
  const { selected, incompatible } = rankEntries(entries, { query: 'cache', target, limit: 5 });
  assert.equal(incompatible, 1);
  assert.deepEqual(
    selected.map(e => e.title),
    ['Cache local', 'Cache API', 'Cache guide'],
  );
});

test('ranking penalizes dead links and dedupes by canonical identity', () => {
  const health = { links: { [sha('https://x.test/dead')]: { state: 'dead' } } };
  const entries = [
    { title: 'Cache a', url: 'https://x.test/dead', canonicalId: 'one' },
    { title: 'Cache b', url: 'https://x.test/live', canonicalId: 'two' },
    { title: 'Cache c', url: 'https://x.test/copy', canonicalId: 'two' },
  ];
  const { selected } = rankEntries(entries, { query: 'cache', target, health, limit: 5 });
  assert.deepEqual(
    selected.map(e => e.title),
    ['Cache b', 'Cache a'],
  );
  assert.equal(selected[1].linkHealth.state, 'dead');
});

test('connectingPath prefers membership edges and skips incompatible nodes', () => {
  const graph = {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'x', versions: ['next@15'] }],
    edges: [
      { source: 'a', target: 'x', relation: 'membership' },
      { source: 'x', target: 'c', relation: 'membership' },
      { source: 'a', target: 'b', relation: 'membership' },
      { source: 'b', target: 'c', relation: 'links to' },
    ],
  };
  const route = connectingPath(graph, 'a', 'c', target);
  assert.deepEqual(route.nodes, ['a', 'b', 'c']);
  assert.equal(route.explanatoryOnly, true);
  assert.equal(connectingPath(graph, 'a', 'x', target), null);
});
