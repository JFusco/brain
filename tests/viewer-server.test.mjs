import assert from 'node:assert/strict';
import test from 'node:test';
import { assetFile, isLocalRequest, strict } from '../scripts/lib/tree/visual/server/request.mjs';

const ORIGIN = 'http://127.0.0.1:4174';
const local = headers => isLocalRequest({ host: '127.0.0.1:4174', ...headers }, 4174, ORIGIN);

test('the viewer accepts only loopback same-origin requests', () => {
  assert.equal(local({}), true);
  assert.equal(local({ origin: ORIGIN, 'sec-fetch-site': 'same-origin' }), true);
  assert.equal(local({ host: 'localhost:4174' }), false, 'DNS rebinding via another host name');
  assert.equal(local({ host: '127.0.0.1:4175' }), false);
  assert.equal(local({ origin: 'https://evil.test' }), false);
  assert.equal(local({ 'sec-fetch-site': 'cross-site' }), false);
  assert.equal(local({ 'sec-fetch-site': 'same-site' }), false);
});

test('only allowlisted built assets are served', () => {
  assert.equal(assetFile('/'), 'index.html');
  assert.equal(assetFile('/assets/index-abc_1.js'), 'assets/index-abc_1.js');
  assert.equal(assetFile('/assets/style.css'), 'assets/style.css');
  for (const path of [
    '/package.json',
    '/assets/../package.json',
    '/assets/..%2Fpackage.json',
    '/assets/a/b.js',
    '/assets/x.map',
    '/index.html.bak',
  ])
    assert.equal(assetFile(path), null, path);
});

test('request bodies must contain only the expected fields', () => {
  assert.deepEqual(strict({ query: 'q' }, ['query', 'domain']), { query: 'q' });
  for (const value of [null, [], 'text', { query: 'q', extra: 1 }])
    assert.throws(() => strict(value, ['query']), /Unsupported request fields/);
});

test('write routes refuse foreign origins and non-JSON before routing', async () => {
  const { postApi } = await import('../scripts/lib/tree/visual/server/api-post.mjs');
  const { getApi } = await import('../scripts/lib/tree/visual/server/api-get.mjs');
  const url = path => new URL(path, ORIGIN);
  const call = async (method, path, headers = {}) => {
    const sent = [];
    const req = { method, headers };
    const handled = await postApi(req, url(path), ORIGIN, (code, data) => sent.push([code, data]));
    return { handled, codes: sent.map(([code]) => code) };
  };
  assert.deepEqual(await call('POST', '/api/route', {}), { handled: true, codes: [403] });
  assert.deepEqual(
    await call('POST', '/api/nope', { origin: ORIGIN, 'content-type': 'text/plain' }),
    {
      handled: true,
      codes: [415],
    },
  );
  // Unknown write paths fall through, so the server answers 405 as before.
  assert.deepEqual(
    await call('POST', '/api/nope', { origin: ORIGIN, 'content-type': 'application/json' }),
    {
      handled: false,
      codes: [],
    },
  );
  assert.deepEqual(await call('GET', '/api/route', { origin: ORIGIN }), {
    handled: false,
    codes: [],
  });
  assert.equal(await getApi({ method: 'POST' }, {}, url('/api/graph'), () => {}), false);
  assert.equal(await getApi({ method: 'GET' }, {}, url('/api/nope'), () => {}), false);
});
