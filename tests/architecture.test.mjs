import assert from 'node:assert/strict';
import test from 'node:test';
import { analyze, layerOf, MAX_LINES } from '../scripts/quality/check-architecture.mjs';

const files = entries => new Map(Object.entries(entries));

test('maps paths to layers', () => {
  assert.equal(layerOf('scripts/lib/leaf/url.mjs'), 'leaf');
  assert.equal(layerOf('scripts/lib/branch/official/registry.mjs'), 'branch');
  assert.equal(layerOf('scripts/lib/tree/cli/commands.mjs'), 'tree');
  assert.equal(layerOf('scripts/brain.mjs'), 'root');
  assert.equal(layerOf('web/brain/main.js'), 'root');
  assert.equal(layerOf('scripts/lib/misc.mjs'), null);
});

test('allows downward imports and rejects upward imports, root-to-root imports and cycles', () => {
  assert.deepEqual(
    analyze(
      files({
        'scripts/brain.mjs': "import x from './lib/tree/a.mjs';",
        'scripts/lib/tree/a.mjs': "import y from '../branch/b.mjs';",
        'scripts/lib/branch/b.mjs': "export const b = await import('../leaf/c.mjs');",
        'scripts/lib/leaf/c.mjs': "import fs from 'node:fs';",
      }),
    ),
    [],
  );
  const problems = analyze(
    files({
      'scripts/lib/leaf/c.mjs': "import t from '../tree/a.mjs';",
      'scripts/lib/tree/a.mjs': "import c from '../leaf/c.mjs';",
      'scripts/nightly.mjs': "import b from './brain.mjs';",
      'scripts/brain.mjs': '',
    }),
  );
  assert.ok(problems.some(p => p.includes('leaf imports higher layer tree')));
  assert.ok(problems.some(p => p.includes('root imports another root')));
  assert.ok(problems.some(p => p.startsWith('import cycle:')));
});

test('flags oversized and unlayered modules', () => {
  const problems = analyze(
    files({ 'scripts/lib/leaf/big.mjs': 'x\n'.repeat(MAX_LINES + 1), 'scripts/lib/x.mjs': '' }),
  );
  assert.deepEqual(problems, [
    `scripts/lib/leaf/big.mjs: ${MAX_LINES + 1} lines exceeds ${MAX_LINES}`,
    'scripts/lib/x.mjs: not in a layer directory',
  ]);
});
