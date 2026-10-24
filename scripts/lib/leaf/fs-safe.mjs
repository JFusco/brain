import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, at } from './paths.mjs';

export function mkdir(dir, mode = 0o755) {
  fs.mkdirSync(dir, { recursive: true, mode });
}
export function atomic(file, data, mode = 0o644) {
  if (inside(ROOT, file)) noSymlinks(ROOT, file);
  mkdir(
    path.dirname(file),
    file.startsWith(at('.state')) || file.startsWith(at('inbox')) ? 0o700 : 0o755,
  );
  const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  try {
    fs.writeFileSync(temporary, data, { mode, flag: 'wx' });
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}
export const writeJSON = (file, value, mode = 0o644) =>
  atomic(file, JSON.stringify(value, null, 2) + '\n', mode);
export function inside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel));
}
// Control characters are rejected on purpose.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTER = /[\x00-\x1f\x7f]/;
export function safePath(relative) {
  if (
    typeof relative !== 'string' ||
    !relative ||
    relative.includes('\\') ||
    CONTROL_CHARACTER.test(relative) ||
    path.isAbsolute(relative) ||
    relative.split('/').some(p => p === '..' || p === '.' || !p)
  )
    throw new Error('Unsafe relative path');
  return relative;
}
export function noSymlinks(root, target) {
  if (!inside(root, target)) throw new Error('Path escapes its managed root');
  let current = root;
  if (fs.lstatSync(root).isSymbolicLink()) throw new Error('Managed root is a symlink');
  for (const part of path.relative(root, target).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (
      fs.existsSync(current)
        ? fs.lstatSync(current).isSymbolicLink()
        : (() => {
            try {
              return fs.lstatSync(current).isSymbolicLink();
            } catch (e) {
              if (e.code === 'ENOENT') return false;
              throw e;
            }
          })()
    )
      throw new Error('Refusing a symlink in a managed path');
  }
}
export function walk(root, { skip = () => false, file = () => true } = {}) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  function visit(dir) {
    for (const entry of fs
      .readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink() || skip(full, entry)) continue;
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && file(full)) out.push(full);
    }
  }
  visit(root);
  return out;
}
