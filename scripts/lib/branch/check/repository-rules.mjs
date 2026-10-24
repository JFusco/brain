import fs from 'node:fs';
import path from 'node:path';
import { walk } from '../../leaf/fs-safe.mjs';
import { at, ROOT } from '../../leaf/paths.mjs';

const TOOL_DIRECTORIES = ['.agents', '.claude', '.cursor', '.codex'];

// No agent-tool discovery directories in Brain, and private storage readable by its owner only.
export function repositoryProblems() {
  const issues = [];
  for (const file of walk(ROOT, {
    skip: (full, entry) =>
      entry.isDirectory() &&
      ['.git', '.state', 'inbox', 'node_modules', 'dist'].includes(entry.name),
  })) {
    const components = path.relative(ROOT, file).split(path.sep);
    if (components.some(p => TOOL_DIRECTORIES.includes(p)))
      issues.push('Brain contains a tool-discovered directory');
  }
  for (const privateFile of ['brain.config.local.json', '.state', 'inbox'])
    if (fs.existsSync(at(privateFile)) && fs.statSync(at(privateFile)).mode & 0o077)
      issues.push('Private storage permissions are too broad');
  return issues;
}
