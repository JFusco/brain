import assert from 'node:assert/strict';
import test from 'node:test';
import { domainFor } from '../scripts/lib/branch/capture/domain.mjs';
import { clientHits, scrub } from '../scripts/lib/branch/privacy/client-terms.mjs';

const TERMS = ['Contoso Health', 'Contoso', 'CTH'];

test('client terms match whole words case-insensitively', () => {
  assert.deepEqual(clientHits('Notes for contoso health and CTH.', TERMS), [
    'Contoso Health',
    'Contoso',
    'CTH',
  ]);
  assert.deepEqual(clientHits('ContosoX and xcth are different words', TERMS), []);
});

test('redaction replaces the longest terms first and every occurrence', () => {
  assert.equal(
    scrub('Contoso Health asked; contoso and CTH agreed.', TERMS),
    '<client> asked; <client> and <client> agreed.',
  );
});

const KEYWORDS = {
  react: ['react', 'useeffect', 'component'],
  frontend: ['css', 'component'],
  'cms/wordpress': ['block', 'theme'],
  nextjs: ['next.js', 'app router'],
};

test('capture routes by keyword score, falling back to unsorted', () => {
  assert.equal(domainFor('App Router caching in Next.js', KEYWORDS), 'nextjs');
  assert.equal(domainFor('Nothing that matches', KEYWORDS), '_unsorted');
});

test('recognizable WordPress context wins a tied React or frontend match', () => {
  assert.equal(domainFor('A React component for a block', KEYWORDS), 'react');
  assert.equal(domainFor('A React component in a block.json theme', KEYWORDS), 'cms/wordpress');
  assert.equal(domainFor('react useEffect component in a block.json', KEYWORDS), 'react');
});
