import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function temporary(t) {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'brain-test-')));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

// Minimal ustar writer: entries are {name, body?, type?} with type '0' (file) by default.
export function tarball(entries, { corruptChecksum = false } = {}) {
  const blocks = [];
  for (const { name, body = '', type = '0' } of entries) {
    const content = Buffer.from(body);
    const header = Buffer.alloc(512);
    header.write(name, 0, 100, 'utf8');
    header.write('0000644\0', 100);
    header.write('0000000\0', 108);
    header.write('0000000\0', 116);
    header.write(content.length.toString(8).padStart(11, '0') + '\0', 124);
    header.write('00000000000\0', 136);
    header.write(type, 156);
    header.write('ustar\0', 257);
    header.write('00', 263);
    header.fill(32, 148, 156);
    let sum = 0;
    for (const byte of header) sum += byte;
    if (corruptChecksum) sum += 1;
    header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
    blocks.push(header, content, Buffer.alloc((512 - (content.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}
