import assert from 'node:assert/strict';
import test from 'node:test';
import { publicationMappings } from '../scripts/lib/branch/capture/publications.mjs';
import { receiptFrom } from '../scripts/lib/branch/capture/receipts.mjs';
const commit = 'a'.repeat(40),
  contentSha256 = 'b'.repeat(64),
  path = 'knowledge/tooling/note.md';
const map = JSON.stringify({ candidate: [{ path, contentSha256 }] });
test('incorporation is explicit and bound to the verified merge snapshot', () => {
  const read = (revision, requested) => {
    assert.equal(revision, commit);
    assert.equal(requested, path);
    return { snapshot: revision, contentSha256 };
  };
  assert.deepEqual(publicationMappings(['candidate'], map, commit, read), {
    candidate: [{ path, commit, contentSha256 }],
  });
  assert.throws(() => publicationMappings(['candidate'], undefined, commit, read), /explicit/);
  assert.throws(() => publicationMappings(['other'], map, commit, read), /exactly/);
  assert.throws(
    () =>
      publicationMappings(['candidate'], map, commit, () => ({
        snapshot: commit,
        contentSha256: 'c'.repeat(64),
      })),
    /match/,
  );
});
test('all request aliases remain associated with a candidate through bounded receipt pages', () => {
  const requests = Object.fromEntries(
    Array.from({ length: 202 }, (_, i) => [
      `r${i}`,
      { requestId: `r${i}`, id: 'candidate', inputSha256: 'input', domain: 'tooling' },
    ]),
  );
  const index = { requests, candidates: { candidate: { status: 'quarantined' } } };
  const first = receiptFrom(index, 'r0');
  assert.equal(first.version, 1);
  assert.equal(first.lineage, 'unknown');
  assert.equal(first.requestIds.length, 100);
  assert.equal(first.nextCursor, '100');
  assert.equal(first.currentStatus, 'quarantined');
  const second = receiptFrom(index, 'r0', first.nextCursor),
    third = receiptFrom(index, 'r0', second.nextCursor);
  assert.equal(new Set([...first.requestIds, ...second.requestIds, ...third.requestIds]).size, 202);
  assert.equal(third.nextCursor, null);
  index.candidates.candidate.disposition = {
    as: 'accepted',
    publications: [{ path, commit, contentSha256 }],
  };
  assert.deepEqual(receiptFrom(index, 'r0').publications, [{ path, commit, contentSha256 }]);
  assert.throws(() => receiptFrom(index, 'r0', -1), /cursor/);
});
