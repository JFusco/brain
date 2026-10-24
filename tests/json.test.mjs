import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJSON } from '../scripts/lib/leaf/json.mjs';

test('parse failures never echo the input', () => {
  const secret = '{"client": "Acme Confidential",';
  assert.throws(
    () => parseJSON(secret),
    error =>
      error.message === 'Invalid JSON in a configured file; content suppressed' && !error.cause,
  );
  assert.deepEqual(parseJSON('{"a":1}'), { a: 1 });
});
