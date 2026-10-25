import assert from 'node:assert/strict';
import test from 'node:test';
import { captureDuration, hubDomain } from '../web/brain/lib/activity.js';
import { neighborhood, overviewReferences } from '../web/brain/lib/knowledge.js';
import { displayPosition, domainAnchor, isVisible, position } from '../web/brain/lib/layout.js';
import { resolveLink } from '../web/brain/lib/links.js';

const NOTE = 'knowledge/react/effects.md';
const known = new Set(['knowledge/react/INDEX.md', 'knowledge/react/state.md']);
const link = href => resolveLink(href, NOTE, id => known.has(id));

test('note links open only known nodes or credential-free HTTPS pages', () => {
  assert.deepEqual(link('state.md'), { kind: 'internal', id: 'knowledge/react/state.md' });
  assert.deepEqual(link('./INDEX.md#top'), { kind: 'internal', id: 'knowledge/react/INDEX.md' });
  assert.deepEqual(link('https://react.dev/learn'), {
    kind: 'external',
    href: 'https://react.dev/learn',
  });
  for (const inert of [
    'missing.md',
    '../../../etc/passwd',
    'http://react.dev/learn',
    'https://user:secret@react.dev/',
    'javascript:alert(1)',
    'data:text/html,hi',
    'mailto:someone@example.com',
    '%E0%A4%A.md',
  ])
    assert.deepEqual(link(inert), { kind: 'inert' }, inert);
});

test('overview visibility keeps structure and expanded references within the focused domain', () => {
  const context = (extra = {}) => ({
    expanded: new Set(),
    overviewReferences: new Set(),
    focusedDomain: '',
    ...extra,
  });
  const page = { id: 'official:a', kind: 'reference', domain: 'react' };
  assert.equal(isVisible({ id: NOTE, kind: 'curated-note', domain: 'react' }, context()), true);
  assert.equal(isVisible(page, context()), false);
  assert.equal(isVisible(page, context({ expanded: new Set([page.id]) })), true);
  assert.equal(isVisible(page, context({ overviewReferences: new Set([page.id]) })), true);
  const vue = context({ focusedDomain: 'vue' });
  assert.equal(isVisible({ id: NOTE, kind: 'curated-note', domain: 'react' }, vue), false);
  assert.equal(isVisible({ id: 'x', kind: 'source', domains: ['react', 'vue'] }, vue), true);
  assert.equal(isVisible({ id: 'knowledge/INDEX.md', kind: 'index' }, vue), true);
});

test('positions are deterministic and focus centers the chosen node', () => {
  const domains = ['react', 'vue'],
    node = { id: NOTE, domain: 'react' };
  assert.deepEqual(position(node, domains), position({ ...node }, domains));
  assert.deepEqual(position({ id: 'knowledge/INDEX.md' }, domains), { x: 0, y: 0, z: 0 });
  const focus = { id: NOTE, neighbors: ['a', 'b'] };
  assert.deepEqual(displayPosition(node, focus, domains), { x: 0, y: 0, z: 0 });
  assert.deepEqual(displayPosition(node, null, domains), position(node, domains));
  const ring = displayPosition({ id: 'a' }, focus, domains);
  assert.ok(Math.abs(Math.hypot(ring.x, ring.y / 0.84) - 52) < 1e-9);
});

test('a neighborhood lists distinct neighbors up to the limit and counts every relationship', () => {
  const edges = [
    { source: 'n', target: 'a' },
    { source: 'a', target: 'n' },
    { source: 'n', target: 'b' },
    { source: 'c', target: 'n' },
    { source: 'a', target: 'b' },
  ];
  const near = neighborhood(edges, 'n', 2);
  assert.deepEqual(near.neighbors, ['a', 'b']);
  assert.deepEqual([...near.ids], ['n', 'a', 'b']);
  assert.equal(near.total, 4);
});

test('the overview shows six pages per source plus every cited reference', () => {
  const pages = Array.from({ length: 8 }, (_, i) => ({ id: `p${i}`, source: 'docs' }));
  const graph = {
    nodes: [{ id: 'source:docs', kind: 'source' }, ...pages, { id: 'cited', source: 'other' }],
    edges: [
      { source: 'note', target: 'cited', relation: 'cites official reference' },
      { source: 'note', target: 'p7', relation: 'related' },
    ],
  };
  assert.deepEqual([...overviewReferences(graph)], ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'cited']);
});

test('activity pulses land inside their domain sector, with a core fallback', () => {
  const domains = ['react', 'vue', 'tailwind'],
    angle = point => (Math.atan2(point.y, point.x) + Math.PI * 2) % (Math.PI * 2);
  assert.equal(domainAnchor('svelte', domains), null);
  const anchor = angle(domainAnchor('vue', domains));
  for (const id of ['knowledge/vue/a.md', 'knowledge/vue/b.md', 'knowledge/vue/c.md']) {
    const offset = angle(position({ id, domain: 'vue' }, domains)) - anchor;
    assert.ok(Math.abs(offset) <= 0.325 + 1e-9, id);
  }
  assert.equal(hubDomain('knowledge/cms/sitecore-ai/INDEX.md'), 'cms/sitecore-ai');
  for (const node of ['knowledge/INDEX.md', 'knowledge/react/effects.md', '', undefined])
    assert.equal(hubDomain(node), null, String(node));
});

test('queued captures play in full until a backlog forms', () => {
  assert.equal(captureDuration(0), 8000);
  assert.equal(captureDuration(3), 8000);
  assert.ok(captureDuration(4) < captureDuration(3));
  assert.ok(captureDuration(13) < captureDuration(4));
});
