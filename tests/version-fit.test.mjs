import assert from 'node:assert/strict';
import test from 'node:test';
import { versionConstraint, versionFit } from '../scripts/lib/branch/project/versions.mjs';

const context = versions => ({
  dependencies: Object.fromEntries(
    Object.entries(versions).map(([name, version]) => [name, { version }]),
  ),
});

test('parses exact and minimum constraints, including scoped packages', () => {
  assert.deepEqual(versionConstraint('next@16'), {
    name: 'next',
    minimum: false,
    version: '16',
    parts: [16],
  });
  assert.deepEqual(versionConstraint('@scope/pkg@>=1.2.3'), {
    name: '@scope/pkg',
    minimum: true,
    version: '1.2.3',
    parts: [1, 2, 3],
  });
  for (const bad of ['next', 'next@^16', 'next@16.x', '@@1'])
    assert.throws(() => versionConstraint(bad), /Version constraints use/, bad);
});

test('matches on the constrained prefix and excludes mismatches', () => {
  assert.equal(versionFit(['next@16'], context({ next: '16.1.0' })).status, 'matched');
  assert.equal(versionFit(['next@16'], context({ next: '15.5.0' })).status, 'incompatible');
  assert.equal(versionFit(['react@>=19.1'], context({ react: '19.2.0' })).status, 'matched');
  assert.equal(versionFit(['react@>=19.1'], context({ react: '19.0.9' })).status, 'incompatible');
});

test('stays unconfirmed without constraints or an installed version', () => {
  assert.equal(versionFit([], context({})).status, 'unconfirmed');
  assert.equal(versionFit(['next@16'], context({})).status, 'unconfirmed');
  assert.equal(versionFit(['next@16.1.0'], context({ next: '16' })).status, 'unconfirmed');
});
