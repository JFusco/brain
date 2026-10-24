import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { ROOT } from '../helpers.mjs';

const require = createRequire(import.meta.url);
const { REQUIRED_CHECKS, validatePullRequestBody } = require('../../scripts/validate_pr_body.cjs');

test('the PR template fails until completed, then satisfies the validator', () => {
  const template = fs.readFileSync(path.join(ROOT, '.github/pull_request_template.md'), 'utf8');
  assert.notDeepEqual(validatePullRequestBody(template), []);
  const answers = [
    'Add the focused quality gate for Brain.',
    'Closes #137',
    '- Add tests, hooks and workflows.',
    '- pnpm run verify:ci passed locally.',
    'New checks can fail existing PRs.',
    'Revert the quality-gate commit.',
  ];
  let index = 0;
  const completed = template
    .replace(/<!--[\s\S]*?-->/g, () => answers[index++])
    .replaceAll('- [ ]', '- [x]');
  assert.equal(index, answers.length);
  assert.deepEqual(validatePullRequestBody(completed), []);
  assert.ok(REQUIRED_CHECKS.includes('`pnpm run verify:ci` passes.'));
});
