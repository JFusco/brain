import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { PassThrough } from 'node:stream';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import { fetchDocumentationCatalog } from '../scripts/lib/branch/official/documentation/fetch.mjs';
import { documentationBytes } from '../scripts/lib/leaf/documentation-bytes.mjs';

const xml = '<urlset><loc>https://docs.example.com/docs/guide</loc></urlset>';
const spec = {
  id: 'test-docs',
  domains: ['semantics'],
  kind: 'collection',
  indexFormat: 'sitemap',
  indexUrl: 'https://docs.example.com/sitemap.xml',
  allowedHosts: ['docs.example.com'],
  includePrefixes: ['/docs/'],
};

function respond(t, bytes, headers = {}) {
  t.mock.method(https, 'get', (_url, _options, callback) => {
    const request = new EventEmitter();
    request.destroy = error => request.emit('error', error);
    queueMicrotask(() => {
      const response = new PassThrough();
      response.statusCode = 200;
      response.headers = { 'content-type': 'text/xml', ...headers };
      response.on('end', () => request.emit('close'));
      callback(response);
      response.end(bytes);
    });
    return request;
  });
}

test('a gzip HTTP response at an XML URL yields the same catalog as plain XML', async t => {
  respond(t, Buffer.from(xml));
  const plain = await fetchDocumentationCatalog(spec);
  t.mock.restoreAll();
  respond(t, gzipSync(xml), { 'content-encoding': 'gzip' });
  assert.deepEqual(await fetchDocumentationCatalog(spec), plain);
});

test('gzip sitemap files and gzip bytes without encoding headers remain bounded', () => {
  const bytes = gzipSync(xml);
  for (const [url, headers] of [
    ['https://docs.example.com/sitemap.xml.gz', {}],
    [spec.indexUrl, {}],
    ['https://docs.example.com/sitemap.xml.gz', { 'content-encoding': 'gzip' }],
  ]) {
    const response = { bytes, url, headers };
    assert.equal(documentationBytes(response, url, 1024).toString(), xml);
    assert.throws(() => documentationBytes(response, url, 16), {
      code: 'ERR_BUFFER_TOO_LARGE',
    });
  }
});

test('HTTP gzip around a gzip sitemap file decodes both bounded layers', () => {
  const response = {
    bytes: gzipSync(gzipSync(xml)),
    url: 'https://docs.example.com/sitemap.xml.gz',
    headers: { 'content-encoding': 'gzip' },
  };
  assert.equal(documentationBytes(response, response.url, 1024).toString(), xml);
});

test('corrupt gzip and unsupported encodings fail instead of becoming catalogs', async t => {
  respond(t, Buffer.from(xml), { 'content-encoding': 'gzip' });
  await assert.rejects(fetchDocumentationCatalog(spec), { code: 'Z_DATA_ERROR' });
  assert.throws(
    () =>
      documentationBytes(
        { bytes: gzipSync(xml), headers: { 'content-encoding': 'br' } },
        spec.indexUrl,
        1024,
      ),
    /Unsupported documentation content encoding/,
  );
});

test('additional pages cannot replace an index with no matching links', async t => {
  const supplemented = {
    ...spec,
    additionalPages: [{ title: 'extra', url: 'https://docs.example.com/docs/extra' }],
  };
  respond(t, Buffer.from('<urlset><loc>https://docs.example.com/en/docs/guide</loc></urlset>'));
  await assert.rejects(fetchDocumentationCatalog(supplemented), /no matching documentation links/);
  t.mock.restoreAll();
  respond(t, Buffer.from(xml));
  const { pages } = await fetchDocumentationCatalog(supplemented);
  assert.deepEqual(
    pages.map(page => page.url),
    ['https://docs.example.com/docs/extra', 'https://docs.example.com/docs/guide'],
  );
});

test('decoded HTML challenges and binary data still fail document validation', async t => {
  for (const [body, expected] of [
    ['<html>Sign in to continue</html>', /Expected text documentation/],
    [Buffer.from([0, 1, 2]), /Unexpected binary documentation/],
  ]) {
    respond(t, gzipSync(body), { 'content-encoding': 'gzip' });
    await assert.rejects(fetchDocumentationCatalog(spec), expected);
    t.mock.restoreAll();
  }
});
