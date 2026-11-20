import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import https from 'node:https';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sha } from '../scripts/lib/leaf/hash.mjs';
import { DAY } from '../scripts/lib/leaf/time.mjs';
import { previewState, work, advance } from '../scripts/lib/branch/slack/work.mjs';
import { evidence } from '../scripts/lib/branch/slack/evidence.mjs';
import { knowledgeProblems } from '../scripts/lib/branch/check/knowledge-rules.mjs';
import { ROOT, temporary } from './helpers.mjs';

const roster = Array.from({ length: 8 }, (_, i) => ({
  id: 'C' + String(100000000 + i),
  domain: 'tooling',
}));
const run = {
  id: 'initial',
  authorId: 'worker',
  trigger: 'scheduled-agent',
  slotDate: '2026-03-12',
  startedAt: '2026-03-12T21:00:00.000Z',
};
const channel = roster[0].id;
const report = {
  authorId: run.authorId,
  rows: roster.map((c, i) => ({
    channel: c.id,
    messagesRead: true,
    threadAccess: true,
    posts: i === 0 ? 9 : 10,
    createdAt: i === 2 ? '2026-02-20' : '2020-01-01',
    resources: { files: 'read', canvases: 'empty', pins: 'read', bookmarks: 'unverified' },
  })),
  replyProbe: {
    channel,
    parentRead: true,
    parentTs: '1771111111.000001',
    searchAfterTs: '1772222222.000001',
    replyTs: '1773000000.000001',
  },
};
const initial = (r = report) => previewState(roster, r, run.startedAt, run.authorId);

test('activation requires all eight channels and an old-parent search proof; seed bounds reflect volume and age', () => {
  const state = initial();
  assert.equal(state.ready, true);
  assert.equal(Date.parse(run.startedAt) - Date.parse(state.channels[channel].start), 365 * DAY);
  assert.equal(
    Date.parse(run.startedAt) - Date.parse(state.channels[roster[1].id].start),
    90 * DAY,
  );
  assert.equal(state.channels[roster[2].id].start, '2026-02-20T00:00:00.000Z');
  assert.equal(
    initial({ ...report, replyProbe: { ...report.replyProbe, parentRead: false } }).ready,
    false,
  );
  assert.equal(
    initial({
      ...report,
      replyProbe: { ...report.replyProbe, searchAfterTs: report.replyProbe.parentTs },
    }).ready,
    false,
  );
  const failed = structuredClone(report);
  Object.assign(failed.rows[0], { messagesRead: false, createdAt: null, posts: null });
  assert.equal(initial(failed).ready, false);
  assert.throws(() => initial({ ...report, rows: report.rows.slice(1) }), /every configured/);
});

test('daily streams resume missed dates independently, preserve partial inventory and rotate bounded seed work', () => {
  const state = initial();
  const after = {
    ...run,
    id: 'later',
    slotDate: '2026-03-16',
    startedAt: '2026-03-16T21:00:00.000Z',
  };
  const live = work(state, roster, after);
  assert.equal(live.length, 48);
  const reply = live.find(t => t.channel === channel && t.stream === 'replies');
  const pins = live.find(t => t.channel === channel && t.stream === 'pins');
  assert.equal(reply.start, run.startedAt);
  advance(state, reply, { gap: 'unavailable' }, after);
  advance(state, pins, { next: 'more', revisions: { one: 'v1' } }, after);
  assert.equal(state.channels[channel].live.replies, run.startedAt);
  assert.deepEqual(state.channels[channel].resources, {});
  for (const t of work(state, roster, after))
    advance(state, t, { next: null, revisions: { two: 'v2' } }, after);
  assert.deepEqual(state.channels[channel].resources.pins, { one: 'v1', two: 'v2' });
  const seed = work(state, roster, after);
  assert.equal(seed.length, 6);
  assert.equal(new Set(seed.map(t => t.channel)).size, 2);
  assert.equal(Date.parse(seed[0].end) - Date.parse(seed[0].start), 7 * DAY);
  for (const task of seed) advance(state, task, { next: null }, after);
  assert.deepEqual(work(state, roster, after), []);
  const tomorrow = {
    ...after,
    id: 'next',
    slotDate: '2026-03-17',
    startedAt: '2026-03-17T21:00:00.000Z',
  };
  const retried = work(state, roster, tomorrow).find(
    t => t.channel === channel && t.stream === 'replies',
  );
  assert.equal(retried.start, run.startedAt);
});

const sourceId = '1773000000.000001';
const permalink =
  'https://fixture.' + 'slack.com/archives/' + channel + '/p' + sourceId.replace('.', '');
const lesson = {
  permalink,
  sourceId,
  decisionKey: 'version-check',
  revision: 'v1',
  decision: 'Check the installed major version',
  applicability: 'Fixture tool version 2',
  support: 'The vendor documents this version requirement.',
  limits: 'Other versions have different requirements.',
  reference: 'https://vendor.example/docs/version',
  checkedAt: run.startedAt,
};
const receipt = { reference: lesson.reference, checkedAt: lesson.checkedAt };
test('fresh research is required and internal provenance stays outside publishable knowledge', () => {
  assert.throws(
    () => evidence(lesson, { channel }, run, 'tooling', null),
    /primary-source evidence/,
  );
  const stale = { ...lesson, checkedAt: '2025-01-01T00:00:00Z' };
  assert.throws(() =>
    evidence(stale, { channel }, run, 'tooling', { ...receipt, checkedAt: stale.checkedAt }),
  );
  assert.throws(() => evidence(lesson, { channel: 'other' }, run, 'tooling', receipt));
  assert.equal(
    evidence(lesson, { channel }, run, 'tooling', receipt).body.includes(permalink),
    false,
  );
  assert.ok(
    knowledgeProblems([{ id: 'knowledge/tooling/test.md', bytes: Buffer.from(permalink) }]).some(
      p => p.includes('private Slack'),
    ),
  );
});

test('interrupted capture is recovered before advancing; replay and zero-lesson pages do not create extra captures', async t => {
  const root = temporary(t);
  fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(root, 'scripts/lib'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'scripts/wiki/lib'), path.join(root, 'scripts/wiki/lib'), {
    recursive: true,
  });
  const save = (file, obj) => {
    const dest = path.join(root, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, JSON.stringify(obj));
  };
  const scanner = '#!/bin/sh\nif [ "$1" = version ]; then echo fixture; fi\nexit 0\n';
  const binary = path.join(root, 'scanner');
  fs.writeFileSync(binary, scanner, { mode: 0o700 });
  save('brain.config.json', {
    domains: ['tooling'],
    capture: { candidateBytes: 16384 },
    toolchain: { gitleaks: binary, gitleaksVersion: 'fixture', gitleaksBinarySha256: sha(scanner) },
  });
  save('.state/slack/channels.json', roster);
  const { slackWork, slackSummary } = await import(
    pathToFileURL(path.join(root, 'scripts/lib/tree/slack/intake.mjs'))
  );
  assert.equal(slackWork(run, 'work').mode, 'preview');
  assert.throws(() => slackWork({ ...run, trigger: 'manual' }, 'preview', report));
  assert.equal(slackWork(run, 'preview', report).ready, true);
  const pin = slackWork(run, 'work').tasks[0];
  const page = { token: pin.token, next: null, revisions: { [sourceId]: 'v1' }, lessons: [lesson] };
  assert.throws(() => slackWork(run, 'page', page), /primary-source/);
  save('official/sources.json', { sources: [], pointers: [{ url: lesson.reference }] });
  const { researchReference } = await import(
    pathToFileURL(path.join(root, 'scripts/lib/tree/slack/reference.mjs'))
  );
  const provider = t.mock.method(https, 'get', (_url, _options, callback) => {
    const req = new EventEmitter();
    const response = Readable.from([Buffer.from('Version 2 requires this configuration.')]);
    Object.assign(response, { statusCode: 200, headers: { 'content-type': 'text/plain' } });
    response.on('end', () => req.emit('close'));
    queueMicrotask(() => callback(response));
    return req;
  });
  await assert.rejects(
    researchReference(run, { url: 'https://unregistered.example/page', query: 'version' }),
    /registered coverage/,
  );
  assert.equal(provider.mock.callCount(), 0);
  const verified = await researchReference(run, { url: lesson.reference, query: 'version' });
  assert.equal(verified.excerpt, 'Version 2 requires this configuration.');
  page.lessons = [{ ...lesson, checkedAt: verified.checkedAt }];
  const originalRename = fs.renameSync;
  const interrupted = t.mock.method(fs, 'renameSync', (from, to) => {
    if (to.endsWith('/progress.json') && fs.existsSync(path.join(root, '.state/harvest.json')))
      throw new Error('checkpoint interruption');
    return originalRename(from, to);
  });
  assert.throws(() => slackWork(run, 'page', page), /checkpoint interruption/);
  interrupted.mock.restore();
  assert.equal(slackWork(run, 'work').tasks[0].token, pin.token);
  assert.equal(slackSummary().requests.length, 1);
  slackWork(run, 'page', page);
  assert.throws(() => slackWork(run, 'page', page), /Stale/);
  const next = slackWork(run, 'work').tasks[0];
  slackWork(run, 'page', { token: next.token, next: null, revisions: {}, lessons: [] });
  assert.equal(slackSummary().requests.length, 1);
  const index = JSON.parse(fs.readFileSync(path.join(root, '.state/harvest.json')));
  assert.equal(Object.keys(index.candidates).length, 1);
});
