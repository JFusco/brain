import assert from 'node:assert/strict';
import test from 'node:test';
import { builtinHits } from '../scripts/lib/branch/privacy/secrets.mjs';

// Fixtures are assembled at runtime so this file never contains a complete
// secret-shaped literal for the repository's own privacy scan to block.
const join = (...parts) => parts.join('');
const BEGIN = join('-----BEGIN ', 'RSA PRIVATE', ' KEY-----');
const END = join('-----END ', 'RSA PRIVATE', ' KEY-----');
const rules = text => builtinHits(text).map(hit => hit.rule);

test('detects GitHub tokens, AWS keys and private keys', () => {
  assert.deepEqual(rules(`token ${join('ghp', '_', 'a'.repeat(36))} here`), ['github-token']);
  assert.deepEqual(rules(join('github', '_pat_', 'b'.repeat(60))), ['github-token']);
  assert.deepEqual(rules(join('AKIA', 'ABCDEFGHIJKLMNOP')), ['aws-key']);
  assert.deepEqual(rules(`${BEGIN}\nabc\n${END}`), ['private-key']);
});

test('an unterminated private key header still blocks', () => {
  assert.deepEqual(rules(`${BEGIN}\ntruncated`), ['private-key']);
});

test('ordinary prose and short look-alikes pass', () => {
  assert.deepEqual(rules('Use ghp_ tokens via gh auth; AKIA prefixes are AWS.'), []);
});
