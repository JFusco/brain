import assert from 'node:assert/strict';
import test from 'node:test';
import { archive } from '../scripts/lib/branch/platform/archive.mjs';
import { tarball } from './helpers.mjs';

test('reads selected regular files and strips the archive root', () => {
  const files = archive(
    tarball([
      { name: 'pkg-1.0/', type: '5' },
      { name: 'pkg-1.0/bin/tool', body: 'binary' },
      { name: 'pkg-1.0/README', body: 'skip me' },
    ]),
    { select: name => name === 'bin/tool' },
  );
  assert.deepEqual([...files.keys()], ['bin/tool']);
  assert.equal(files.get('bin/tool').toString(), 'binary');
});

test('rejects traversal entries before selection', () => {
  assert.throws(
    () => archive(tarball([{ name: 'pkg/../../evil', body: 'x' }])),
    /Unsafe relative path/,
  );
});

test('rejects selected links and duplicate paths', () => {
  assert.throws(() => archive(tarball([{ name: 'pkg/link', type: '2' }])), /not a regular file/);
  assert.throws(
    () =>
      archive(
        tarball([
          { name: 'pkg/a', body: '1' },
          { name: 'pkg/a', body: '2' },
        ]),
      ),
    /Duplicate archive path/,
  );
});

test('rejects corrupt headers and archives with no approved files', () => {
  assert.throws(
    () => archive(tarball([{ name: 'pkg/a', body: '1' }], { corruptChecksum: true })),
    /checksum/,
  );
  assert.throws(
    () => archive(tarball([{ name: 'pkg/a', body: '1' }]), { select: () => false }),
    /no approved files/,
  );
});
