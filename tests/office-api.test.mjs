import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { chmodSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { publishedRead } from '../scripts/lib/branch/office/published-read.mjs';
import { compareCurrentNote } from '../scripts/lib/branch/office/current-status.mjs';
import { readCommittedNote } from '../scripts/lib/branch/visual/snapshot/blobs.mjs';
import { addKnowledge } from '../scripts/lib/branch/visual/snapshot/knowledge-nodes.mjs';
import { createGraph } from '../scripts/lib/branch/visual/snapshot/graph.mjs';
import { projectContext } from '../scripts/lib/branch/project/context.mjs';
import { publishedMap } from '../scripts/lib/branch/office/published-map.mjs';
import { publishedSearch } from '../scripts/lib/branch/office/published-search.mjs';
import { readOnlyScan } from '../scripts/lib/branch/privacy/scan-receipt.mjs';
import { plan } from '../scripts/lib/tree/cli/commands.mjs';
import { args } from '../scripts/lib/leaf/cli-args.mjs';
import { gitNotes, knowledgeNote } from './helpers.mjs';
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
test('Office interfaces are read-only CLI commands with explicit flags', async () => {
  for (const argv of [
    ['scan', '--stdin', '--secrets-only'],
    ['snapshot'],
    ['search', '--snapshot', revision, '--query', 'q', '--kind', 'note', '--versions', 'x@1'],
    ['read', '--snapshot', revision, '--path', note.path],
    ['read', '--snapshot', revision, '--path', note.path, '--current-status'],
    ['read', '--snapshot', revision, '--path', note.path, '--include-withdrawn'],
    [
      'read',
      '--snapshot',
      revision,
      '--path',
      note.path,
      '--include-withdrawn',
      '--current-status',
      '--versions',
      'node@24',
    ],
  ]) {
    const parsed = args(argv);
    assert.equal(plan(parsed.positional, parsed.flags).mutating, false);
  }
  for (const flag of ['include-withdrawn', 'current-status'])
    assert.throws(() => args([`--${flag}=false`]), /does not take a value/);
  const read = (...options) => {
    const parsed = args(['read', '--snapshot', revision, '--path', note.path, ...options]);
    return plan(parsed.positional, parsed.flags).execute();
  };
  await assert.rejects(read('--versions', 'node@24'), /requires --current-status/);
  await assert.rejects(read('--current-status', '--versions', 'node@>=24'), /must be literal/);
  await assert.rejects(read('--current-status', '--versions', 'x'.repeat(2001)), /2,000/);
});

test('withdrawn audit reads require a valid committed note and preserve original bytes', t => {
  const { run, write, commit, root } = gitNotes(t);
  const withdrawn = Buffer.concat([
    Buffer.from([0xef, 0xbb, 0xbf]),
    knowledgeNote({ status: 'retired' }),
  ]);
  write(note.path, withdrawn);
  write('knowledge/tooling/INDEX.md', withdrawn);
  write('knowledge/_templates/example.md', withdrawn);
  write('inbox/example.md', withdrawn);
  write('knowledge/tooling/invalid.md', 'invalid');
  write('knowledge/tooling/invalid-utf8.md', Buffer.concat([withdrawn, Buffer.from([0xff])]));
  write('knowledge/tooling/large.md', Buffer.alloc(256 * 1024 + 1));
  write('knowledge/tooling/executable.md', withdrawn);
  chmodSync(join(root, 'knowledge/tooling/executable.md'), 0o755);
  symlinkSync('example.md', join(root, 'knowledge/tooling/linked.md'));
  const head = commit();
  const load = () => ({ revision: head, entries: [] });
  const read = (sha, path) => readCommittedNote(sha, path, { run });
  const opts = { load, read, includeWithdrawn: true };
  assert.throws(() => publishedRead(head, note.path, { load, read }), /unavailable/);
  assert.deepEqual(publishedRead(head, note.path, opts), {
    version: 1,
    snapshot: head,
    path: note.path,
    text: withdrawn.toString(),
    contentSha256: sha(withdrawn),
    statusAtSnapshot: 'retired',
    eligible: false,
  });
  for (const path of [
    'knowledge/tooling/INDEX.md',
    'knowledge/_templates/example.md',
    'inbox/example.md',
    'knowledge/tooling/invalid.md',
    'knowledge/tooling/invalid-utf8.md',
    'knowledge/tooling/large.md',
    'knowledge/tooling/executable.md',
    'knowledge/tooling/linked.md',
    'knowledge/tooling/missing.md',
  ])
    assert.throws(() => publishedRead(head, path, opts), /unavailable/, path);
  run('switch', '-c', 'unmerged');
  assert.throws(() => read(commit(), note.path), /merge-base/);
  assert.throws(
    () => publishedRead(head, note.path, { ...opts, load: () => graph, blobs: () => new Map() }),
    /hash mismatch/,
  );
});

test('current comparison distinguishes revision, freshness, replacement, and failure', () => {
  const original = knowledgeNote();
  const historical = { path: note.path, text: original.toString(), contentSha256: sha(original) };
  const replacement = 'knowledge/tooling/replacement.md';
  const superseded = target => knowledgeNote({ status: 'superseded', replacement: target });
  const lock = { sources: { docs: { revision: 'abcdef0123456789' } } };
  const compare = (entries, context, sources = lock) =>
    compareCurrentNote(historical, context, {
      main: () => revision,
      load: () =>
        new Map([['official/sources.lock.json', Buffer.from(JSON.stringify(sources))], ...entries]),
      read: (rev, path, { blobs }) =>
        readCommittedNote(rev, path, {
          blobs,
          run: () => Buffer.alloc(0),
        }),
    });
  const chain = length =>
    Array.from({ length: length + 1 }, (_, i) => [
      i === 0 ? note.path : `knowledge/tooling/hop-${i}.md`,
      i === length ? original : superseded(`knowledge/tooling/hop-${i + 1}.md`),
    ]);
  for (const [outcome, entries] of [
    ['unchanged', [[note.path, original]]],
    [
      'updated',
      [[note.path, Buffer.from(original.toString().replace('2999-01-01', '2999-01-02'))]],
    ],
    ['deleted', []],
    ['invalid', [[note.path, Buffer.from('invalid')]]],
    ['retired', [[note.path, knowledgeNote({ status: 'retired' })]]],
    ['superseded', chain(8)],
    ['depth-exceeded', chain(9)],
    ['missing-replacement', [[note.path, superseded(replacement)]]],
    [
      'cycle',
      [
        [note.path, superseded(replacement)],
        [replacement, superseded(note.path)],
      ],
    ],
    ['unavailable', [[note.path, original]]],
  ]) {
    const result = compare(entries, undefined, outcome === 'unavailable' ? {} : lock);
    assert.equal(result.outcome, outcome);
    if (outcome === 'updated') {
      assert.equal(result.bytesChanged, true);
      assert.equal(result.correctionsChanged, false);
    }
  }
  const entries = [
    [note.path, superseded(replacement)],
    [replacement, original],
  ];
  const result = compare(entries, projectContext(undefined, { versions: 'node@22' }));
  assert.equal(result.target.path, replacement);
  assert.equal(result.target.versionFit.status, 'incompatible');
  assert.equal(compare(entries).target.versionFit, undefined);
  assert.equal(
    compare(entries, projectContext(undefined, { versions: 'next@16' })).target.versionFit.status,
    'unconfirmed',
  );
  assert.equal(
    compare([[note.path, original]], undefined, { sources: {} }).target.freshness.status,
    'needs-revalidation',
  );
  const current = createGraph();
  addKnowledge(current, new Map(entries), lock);
  const response = publishedSearch({ snapshot: revision, query: 'Example', kind: 'note' }, () => ({
    ...current,
    nodes: [...current.nodes.values()],
    revision,
  }));
  assert.deepEqual(
    response.results.map(entry => entry.path),
    [replacement],
  );

  const opts = { load: () => graph, blobs: () => new Map([[note.path, old]]) };
  const failed = publishedRead(revision, note.path, {
    ...opts,
    currentStatus: true,
    compare: read =>
      compareCurrentNote(read, undefined, {
        main: () => revision,
        load: () => {
          throw new Error('Unavailable');
        },
      }),
  });
  const { currentStatus, ...pinned } = failed;
  assert.equal(currentStatus.outcome, 'unavailable');
  assert.equal(currentStatus.target, null);
  assert.deepEqual(pinned, {
    version: 1,
    snapshot: revision,
    path: note.path,
    contentSha256: sha(old),
    text: old.toString(),
  });
  assert.deepEqual(pinned, publishedRead(revision, note.path, opts));
});

test('correction comparison finds late and fenced changes and reports deletion without an excerpt', () => {
  const prefix = '## Corrections\n\n' + 'Earlier correction.\n'.repeat(300);
  const body =
    prefix + '\n```text\n## Example heading\nOld example\n```\n\n2026-11-22 Removed entry.';
  const original = knowledgeNote({ body });
  const historical = { path: note.path, text: original.toString(), contentSha256: sha(original) };
  const compare = body =>
    compareCurrentNote(historical, undefined, {
      main: () => revision,
      load: () =>
        new Map([
          [note.path, knowledgeNote({ body })],
          ['official/sources.lock.json', Buffer.from('{"sources":{}}')],
        ]),
    });
  const updated = body.replace('Old example', 'New example');
  const { correctionsChanged, corrections } = compare(updated);
  assert.equal(correctionsChanged, true);
  assert.match(corrections.excerpt, /^New example/);
  assert.ok(corrections.excerpt.length <= 4000);
  const lines = knowledgeNote({ body: updated }).toString().split('\n');
  assert.equal(lines[corrections.startLine - 1], 'New example');
  const removed = compare(body.replace('2026-11-22 Removed entry.', ''));
  assert.equal(removed.correctionsChanged, true);
  assert.equal(removed.corrections, null);
});
