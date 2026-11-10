import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { publishedRead } from '../scripts/lib/branch/office/published-read.mjs';
import { publishedMap } from '../scripts/lib/branch/office/published-map.mjs';
import { publishedSearch } from '../scripts/lib/branch/office/published-search.mjs';
import { readOnlyScan } from '../scripts/lib/branch/privacy/scan-receipt.mjs';
import { plan } from '../scripts/lib/tree/cli/commands.mjs';
import { args } from '../scripts/lib/leaf/cli-args.mjs';
const sha = x => createHash('sha256').update(x).digest('hex');
const revision = 'a'.repeat(40),
  old = Buffer.from('Committed old bytes\n');
const note = {
  id: 'knowledge/tooling/example.md',
  path: 'knowledge/tooling/example.md',
  title: 'Example tooling',
  kind: 'curated-note',
  sha256: sha(old),
  summary: 'Useful technique',
  versions: ['node@24'],
};
const graph = { revision, entries: [note], nodes: [note], edges: [] };
test('historical note reads exact requested committed bytes and rejects substitutions and unbounded bodies', () => {
  const load = requested => {
    assert.equal(requested, revision);
    return graph;
  };
  const blobs = requested => {
    assert.equal(requested, revision);
    return new Map([[note.path, old]]);
  };
  assert.equal(publishedRead(revision, note.path, { load, blobs }).text, old.toString());
  assert.throws(() => publishedRead(revision, 'inbox/private.md', { load, blobs }), /unavailable/);
  assert.throws(
    () =>
      publishedRead(revision, note.path, {
        load,
        blobs: () => new Map([[note.path, Buffer.from('working tree')]]),
      }),
    /hash mismatch/,
  );
  assert.throws(() => publishedRead('HEAD', note.path, { load, blobs }), /snapshot/);
  const big = Buffer.alloc(256 * 1024 + 1);
  assert.throws(
    () =>
      publishedRead(revision, note.path, {
        load: () => ({ ...graph, entries: [{ ...note, sha256: sha(big) }] }),
        blobs: () => new Map([[note.path, big]]),
      }),
    /256 KiB/,
  );
  const withBytes = bytes => ({
    load: () => ({ ...graph, entries: [{ ...note, sha256: sha(bytes) }] }),
    blobs: () => new Map([[note.path, bytes]]),
  });
  const bom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), old]);
  const read = publishedRead(revision, note.path, withBytes(bom));
  assert.deepEqual(Buffer.from(read.text), bom);
  assert.equal(sha(Buffer.from(read.text)), read.contentSha256);
  assert.throws(() => publishedRead(revision, note.path, withBytes(Buffer.from([0xff]))));
});
test('snapshot pagination retains deterministic IDs and edges without exceeding limits', () => {
  // Nested, multi-field nodes make the CLI's indented encoding bind before the 500-node cap.
  const large = {
    ...graph,
    nodes: Array.from({ length: 1100 }, (_, i) => ({
      id: `node-${String(i).padStart(4, '0')}`,
      title: 'Boundary node',
      summary: 's'.repeat(900),
      versions: ['next@16', 'react@19'],
      freshness: { status: 'current', reviewedAt: '2026-11-09', sources: ['a@1', 'b@2'] },
    })),
    edges: Array.from({ length: 1500 }, (_, i) => ({
      source: `node-${i}`,
      target: `node-${i + 1}`,
      relation: 'cites',
    })),
  };
  let cursor,
    first,
    nodes = [],
    edges = [];
  do {
    const page = publishedMap({ snapshot: revision, cursor }, () => large);
    assert.ok(page.nodes.length <= 500);
    assert.ok(page.edges.length <= 1000);
    // Exactly what scripts/brain.mjs emits.
    assert.ok(Buffer.byteLength(JSON.stringify(page, null, 2) + '\n') <= 512 * 1024);
    nodes.push(...page.nodes);
    edges.push(...page.edges);
    cursor = page.nextCursor;
    first ??= page;
  } while (cursor);
  assert.ok(first.nodes.length < 500, 'byte budget binds first');
  assert.equal(nodes.length, 1100);
  assert.equal(new Set(nodes.map(n => n.id)).size, 1100);
  assert.equal(edges.length, 1500);
  assert.equal(new Set(edges.map(e => JSON.stringify(e))).size, 1500);
  assert.throws(
    () => publishedMap({ snapshot: revision, cursor: 'broken' }, () => large),
    /cursor/,
  );
});
test('search ranks only published notes with bounded inputs', () => {
  const result = publishedSearch(
    { snapshot: revision, query: 'tooling', kind: 'note', limit: 5 },
    () => ({
      ...graph,
      entries: [...graph.entries, { ...note, id: 'inbox', path: 'inbox', kind: 'candidate' }],
    }),
  );
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].contentSha256, sha(old));
  assert.equal(result.results[0].compatibility.status, 'unconfirmed');
  assert.equal(result.incompatible, 0);
  assert.throws(
    () => publishedSearch({ snapshot: revision, query: 'x'.repeat(2001), kind: 'note' }),
    /bounded/,
  );
  assert.throws(
    () => publishedSearch({ snapshot: revision, query: 'x', kind: 'note', limit: 21 }),
    /limit/,
  );
});
test('search applies optional explicit version context through the existing ranker', () => {
  const versioned = () => ({
    ...graph,
    entries: [
      { ...note, id: 'a', path: 'knowledge/tooling/a.md', versions: ['next@15'] },
      { ...note, id: 'b', path: 'knowledge/tooling/b.md', versions: ['next@16'] },
    ],
  });
  const request = { snapshot: revision, query: 'tooling', kind: 'note' };
  const search = versions => publishedSearch({ ...request, versions }, versioned);
  const filtered = search('next@16');
  assert.deepEqual(
    filtered.results.map(n => n.id),
    ['b'],
  );
  assert.equal(filtered.results[0].compatibility.status, 'matched');
  assert.equal(filtered.incompatible, 1);
  const unfiltered = search(undefined);
  assert.equal(unfiltered.results.length, 2);
  assert.equal(unfiltered.incompatible, 0);
  assert.ok(unfiltered.results.every(n => n.compatibility.status === 'unconfirmed'));
  assert.throws(() => search('x'.repeat(2001)), /2,000/);
});
test('search rejects responses over the bound in the emitted indented encoding', () => {
  const notes = Array.from({ length: 20 }, (_, i) => ({
    ...note,
    id: `n${i}`,
    path: `knowledge/tooling/n${i}.md`,
    summary: 's'.repeat(10000),
  }));
  const edges = notes.flatMap(n =>
    Array.from({ length: 200 }, (_, j) => ({ source: n.id, target: `r${j}` })),
  );
  // Compact JSON would fit: notes, citations (plus "url":null) and per-result metadata.
  const extra = edges.length * ',"url":null'.length + 20 * 400;
  assert.ok(Buffer.byteLength(JSON.stringify([notes, edges])) + extra < 512 * 1024);
  // Indenting thousands of nested citations pushes the emitted response over the bound.
  const load = () => ({ ...graph, entries: notes, edges });
  const request = { snapshot: revision, query: 'tooling', kind: 'note', limit: 20 };
  assert.throws(() => publishedSearch(request, load), /exceeds its bound/);
});
test('read-only secret scan emits rule and line metadata without values, IDs or reports', () => {
  const toolchain = { gitleaksVersion: 'fixture', gitleaksBinarySha256: 'pinned' };
  const receipt = readOnlyScan('private synthetic bytes', {
    toolchain,
    scanText: () => [
      {
        id: 'private-id',
        rule: 'test',
        line: 1,
        endLine: 1,
        secret: 'never export',
        lineSha256: 'private hash',
      },
    ],
  });
  assert.deepEqual(receipt.findings, [{ rule: 'test', line: 1, endLine: 1 }]);
  assert.equal(receipt.clean, false);
  assert.equal(receipt.inputSha256, sha('private synthetic bytes'));
  assert.throws(
    () => readOnlyScan(Buffer.alloc(1024 * 1024 + 1), { toolchain, scanText: () => [] }),
    /1 MiB/,
  );
  assert.throws(() => readOnlyScan(Buffer.from([0xff]), { toolchain, scanText: () => [] }));
  assert.throws(
    () =>
      readOnlyScan('text', {
        toolchain,
        scanText: () => {
          throw Error('unavailable');
        },
      }),
    /unavailable/,
  );
});
test('Office interfaces are read-only CLI commands with explicit flags', () => {
  for (const argv of [
    ['scan', '--stdin', '--secrets-only'],
    ['snapshot'],
    ['search', '--snapshot', revision, '--query', 'q', '--kind', 'note', '--versions', 'x@1'],
    ['read', '--snapshot', revision, '--path', note.path],
  ]) {
    const parsed = args(argv);
    assert.equal(plan(parsed.positional, parsed.flags).mutating, false);
  }
});
