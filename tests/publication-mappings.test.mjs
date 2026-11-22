import assert from 'node:assert/strict';
import test from 'node:test';
import { publicationMappings } from '../scripts/lib/branch/capture/publications.mjs';
import { receiptFrom } from '../scripts/lib/branch/capture/receipts.mjs';
import { verifyWithdrawal } from '../scripts/lib/branch/capture/withdrawal.mjs';
import { publishedRead } from '../scripts/lib/branch/office/published-read.mjs';
import { compareCurrentNote } from '../scripts/lib/branch/office/current-status.mjs';
import { readCommittedNote } from '../scripts/lib/branch/visual/snapshot/blobs.mjs';
import { sha } from '../scripts/lib/leaf/hash.mjs';
import { gitNotes, knowledgeNote } from './helpers.mjs';
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

test('mixed publication maps dispatch each verifier and reject the batch on a bad withdrawal', () => {
  const active = { path, contentSha256 };
  const withdrawn = { kind: 'withdrawal', path: 'knowledge/tooling/withdrawn.md', contentSha256 };
  const input = JSON.stringify({ candidate: [active, withdrawn] });
  const read = (snapshot, requested) => {
    assert.equal(requested, path);
    return { snapshot, contentSha256 };
  };
  const verify = (...args) => assert.deepEqual(args, [commit, withdrawn.path, contentSha256]);
  assert.deepEqual(publicationMappings(['candidate'], input, commit, read, verify), {
    candidate: [
      { ...active, commit },
      { ...withdrawn, commit },
    ],
  });
  assert.throws(
    () =>
      publicationMappings(['candidate'], input, commit, read, () => {
        throw new Error('Failed transition');
      }),
    /Failed transition/,
  );
  assert.throws(
    () =>
      publicationMappings(
        ['candidate'],
        JSON.stringify({
          candidate: [active, { ...withdrawn, path }],
        }),
        commit,
        read,
        verify,
      ),
    /Invalid publication mapping/,
  );
});

test('withdrawal receipts prove the transition in the landed commit and audit its exact bytes', t => {
  const repo = gitNotes(t);
  const replacement = 'knowledge/tooling/replacement.md';
  const original = knowledgeNote();
  const retired = knowledgeNote({ status: 'retired', body: 'Withdrawn after review.' });
  const superseded = knowledgeNote({ status: 'superseded', replacement });
  repo.write(path, original);
  repo.write(replacement, original);
  const prBase = repo.commit();
  repo.write('unrelated.txt', 'main advanced before the PR landed');
  const before = repo.commit();
  assert.notEqual(before, prBase);
  repo.write(path, retired);
  const landed = repo.commit();
  const verify = (commit, path, digest) =>
    verifyWithdrawal(commit, path, digest, { run: repo.run });
  const entries = { candidate: [{ kind: 'withdrawal', path, contentSha256: sha(retired) }] };
  const publications = publicationMappings(
    ['candidate'],
    JSON.stringify(entries),
    landed,
    undefined,
    verify,
  );
  const receipt = receiptFrom(
    {
      requests: { request: { requestId: 'request', id: 'candidate' } },
      candidates: {
        candidate: {
          status: 'pending',
          disposition: { as: 'accepted', publications: publications.candidate },
        },
      },
    },
    'request',
  ).publications[0];
  const read = (commit, path, { blobs } = {}) =>
    readCommittedNote(commit, path, { run: repo.run, blobs });
  const audit = (latest, contents) =>
    publishedRead(receipt.commit, receipt.path, {
      load: revision => ({ revision, entries: [] }),
      read,
      includeWithdrawn: true,
      currentStatus: true,
      compare: note =>
        compareCurrentNote(note, undefined, {
          main: () => latest,
          load: () =>
            new Map([...contents, ['official/sources.lock.json', Buffer.from('{"sources":{}}')]]),
          read,
        }),
    });
  const historical = audit(landed, [[path, retired]]);
  assert.equal(historical.text, retired.toString());
  assert.equal(historical.contentSha256, receipt.contentSha256);
  assert.equal(historical.currentStatus.outcome, 'retired');
  assert.equal(historical.currentStatus.target, null);
  assert.throws(() => verify(landed, path, sha(original)), /match/);
  assert.throws(() => verify(landed, replacement, sha(original)), /did not change/);
  assert.throws(() => verify(prBase, path, sha(original)), /one local parent/);
  assert.throws(() => verify('f'.repeat(40), path, sha(retired)), /commit is unavailable/);

  repo.write(path, superseded);
  const later = repo.commit();
  const comparison = audit(later, [
    [path, superseded],
    [replacement, original],
  ]).currentStatus;
  assert.equal(comparison.outcome, 'superseded');
  assert.equal(comparison.target.path, replacement);
  assert.throws(() => verify(later, path, sha(superseded)), /eligible note/);
  assert.throws(() => verify(repo.commit(), path, sha(superseded)), /did not change/);

  repo.run('switch', '-c', 'side');
  repo.write('side.txt', 'side');
  repo.commit();
  repo.run('switch', 'main');
  repo.run('merge', '--no-ff', '--no-edit', 'side');
  const merged = repo.run('rev-parse', 'HEAD').toString().trim();
  assert.throws(() => verify(merged, path, sha(superseded)), /one local parent/);
});
