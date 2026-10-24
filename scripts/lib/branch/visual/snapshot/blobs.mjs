// Read only allowlisted committed blobs. Never export Git internals or working edits.
import { execFileSync } from 'node:child_process';
import { ROOT } from '../../../leaf/paths.mjs';

export const git = (...args) =>
  execFileSync('git', args, {
    cwd: ROOT,
    maxBuffer: 48 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
export function mainRevision() {
  return git('rev-parse', '--verify', 'refs/heads/main^{commit}').toString().trim();
}
const allowed = name =>
  /^knowledge\/(?!.*(?:^|\/)_(?:templates)(?:\/|$)).+\.md$/.test(name) ||
  ['official/sources.json', 'official/sources.lock.json', 'brain.config.json'].includes(name) ||
  /^official\/catalogs\/[a-z0-9-]+\.json$/.test(name);

// Allowlisted blobs of a main-ancestor revision, read in one bounded batch.
export function committedBlobs(revision) {
  git('merge-base', '--is-ancestor', revision, 'refs/heads/main');
  const files = git(
    'ls-tree',
    '-r',
    '-z',
    revision,
    '--',
    'knowledge',
    'official',
    'brain.config.json',
  )
    .toString()
    .split('\0')
    .filter(Boolean)
    .map(row => {
      const m = row.match(/^(\d+) blob ([a-f0-9]+)\t(.+)$/);
      return m && m[1] === '100644' && allowed(m[3]) ? { id: m[3], oid: m[2] } : null;
    })
    .filter(Boolean);
  const totalLimit = 48 * 1024 * 1024;
  const batch = execFileSync('git', ['cat-file', '--batch'], {
    cwd: ROOT,
    input: files.map(f => f.oid).join('\n') + '\n',
    maxBuffer: totalLimit,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const contents = new Map();
  let offset = 0;
  for (const file of files) {
    const end = batch.indexOf(10, offset),
      header = batch.subarray(offset, end).toString().split(' '),
      size = Number(header[2]);
    if (header[1] !== 'blob' || size > 4 * 1024 * 1024)
      throw new Error('Snapshot file exceeds its bound');
    contents.set(file.id, batch.subarray(end + 1, end + 1 + size));
    offset = end + size + 2;
  }
  return contents;
}
