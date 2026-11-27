import fs from 'node:fs';
import path from 'node:path';
import { walk } from '../../leaf/fs-safe.mjs';
import { ROOT } from '../../leaf/paths.mjs';

const TOOL_DIRECTORIES = ['.agents', '.claude', '.cursor', '.codex'];
// Owner-only modes that `check` (and therefore nightly `prepare`) expects for private storage.
const PRIVATE_STORAGE = [
  ['brain.config.local.json', '0600'],
  ['.state', '0700'],
  ['inbox', '0700'],
];

// No agent-tool discovery directories in Brain, and private storage readable by its owner only.
export function repositoryProblems(root = ROOT) {
  const issues = [];
  for (const file of walk(root, {
    skip: (full, entry) =>
      entry.isDirectory() &&
      ['.git', '.state', 'inbox', 'node_modules', 'dist'].includes(entry.name),
  })) {
    const components = path.relative(root, file).split(path.sep);
    if (components.some(p => TOOL_DIRECTORIES.includes(p)))
      issues.push('Brain contains a tool-discovered directory');
  }
  for (const [name, mode] of PRIVATE_STORAGE) {
    const file = path.join(root, name);
    if (fs.existsSync(file) && fs.statSync(file).mode & 0o077)
      issues.push(`Private storage permissions are too broad: ${name} must be ${mode}`);
  }
  return issues;
}
