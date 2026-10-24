import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { safePath, walk } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';

const CONFIG_FILES = [
  'README.md',
  'STATUS.md',
  'AGENTS.md',
  'CLAUDE.md',
  'brain.config.json',
  'package.json',
  'pnpm-lock.yaml',
  '.npmrc',
  'official/sources.json',
  'official/sources.lock.json',
  '.gitignore',
];
const CONTENT_ROOTS = [
  'knowledge',
  'skills',
  'wiki',
  'scripts',
  'web',
  '.githooks',
  '.github',
  'official/catalogs',
];

// Staged index blobs, so the gate checks exactly what a commit would publish.
export function stagedEntries(issues) {
  const entries = [];
  const list = spawnSync('git', ['ls-files', '--stage', '-z'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (list.status !== 0) throw new Error('Could not read staged index');
  for (const record of list.stdout.split('\0').filter(Boolean)) {
    const match = record.match(/^(\d+) ([0-9a-f]+) (\d)\t([\s\S]+)$/);
    if (!match) throw new Error('Invalid staged index entry');
    const [, mode, oid, stage, name] = match;
    if (stage !== '0') {
      issues.push('Unmerged index entries');
      continue;
    }
    safePath(name);
    if (/^(?:inbox\/|\.state\/|brain\.config\.local\.json$)/.test(name)) {
      issues.push('Private content is staged');
      continue;
    }
    if (mode !== '100644' && mode !== '100755') {
      issues.push(`Unsupported staged file type: ${name}`);
      continue;
    }
    const result = spawnSync('git', ['cat-file', 'blob', oid], {
      cwd: ROOT,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.status !== 0) throw new Error('Could not read staged blob');
    if (result.stdout.length > 1024 * 1024 && name.startsWith('official/'))
      issues.push('Oversized vendor file is staged');
    entries.push({ id: name, bytes: result.stdout });
  }
  return entries;
}

// Public working-tree content.
export function treeEntries() {
  const entries = [];
  for (const name of CONFIG_FILES)
    if (fs.existsSync(at(name))) entries.push({ id: name, bytes: fs.readFileSync(at(name)) });
  for (const name of CONTENT_ROOTS)
    for (const file of walk(at(name), {
      skip: (full, entry) => entry.isDirectory() && ['node_modules', 'dist'].includes(entry.name),
    }))
      entries.push({
        id: path.relative(ROOT, file).split(path.sep).join('/'),
        bytes: fs.readFileSync(file),
      });
  return entries;
}
