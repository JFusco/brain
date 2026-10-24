import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { officialProblems } from '../scripts/lib/branch/official/validate.mjs';
import { ROOT } from './helpers.mjs';

const REGISTRY = 'official/sources.json';
const tracked = name => {
  const file = path.join(ROOT, name);
  return fs.existsSync(file) ? fs.readFileSync(file) : null;
};
const names = () => [
  REGISTRY,
  'official/sources.lock.json',
  ...fs.readdirSync(path.join(ROOT, 'official/catalogs')).map(n => `official/catalogs/${n}`),
];
const withRegistry = edit => {
  const registry = JSON.parse(tracked(REGISTRY));
  edit(registry);
  return name => (name === REGISTRY ? Buffer.from(JSON.stringify(registry)) : tracked(name));
};

test('the committed registry, lock, catalogs and hubs validate', () => {
  assert.deepEqual(officialProblems(tracked, names()).issues, []);
});

test('registry fields are strict and domains must be configured', () => {
  const unsupported = withRegistry(r => (r.sources[0].unexpected = true));
  assert.match(
    officialProblems(unsupported, names()).issues.join(),
    /unsupported field unexpected/,
  );
  const domain = withRegistry(r => (r.sources[0].domains = ['nope']));
  assert.match(officialProblems(domain, names()).issues.join(), /unknown domain/);
});

test('URL sources must be HTTPS on an allowed host', () => {
  const insecure = withRegistry(r => {
    const source = r.sources.find(s => s.kind === 'url');
    source.url = source.url.replace('https:', 'http:');
  });
  assert.match(
    officialProblems(insecure, names()).issues.join(),
    /url must be HTTPS on an allowed host/,
  );
});

test('a catalog that differs from its lock entry is an issue', () => {
  const [catalog] = names().filter(n => n.startsWith('official/catalogs/'));
  const read = name => (name === catalog ? Buffer.from('{}') : tracked(name));
  assert.match(
    officialProblems(read, names()).issues.join(),
    /catalog differs from its lock entry/,
  );
});

test('unexpected official files are issues when staged and warnings otherwise', () => {
  const extra = [...names(), 'official/stray.json'];
  assert.match(officialProblems(tracked, extra).warnings.join(), /unexpected files under official/);
  assert.match(
    officialProblems(tracked, extra, { unexpected: 'issues' }).issues.join(),
    /unexpected files under official/,
  );
});
