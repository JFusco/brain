import { gunzipSync } from 'node:zlib';
import { safePath, config } from './core.mjs';

// Read selected regular files directly; never unpack untrusted archive paths.
export function archive(bytes, { select = () => true, stripRoot = true } = {}) {
  const data = gunzipSync(bytes, { maxOutputLength: config().network.maxExpandedBytes });
  const out = new Map();
  let offset = 0,
    extended = {},
    global = {},
    longName = null,
    count = 0;
  const string = b => b.toString('utf8').replace(/\0.*$/s, '');
  const number = b => {
    const value = string(b).trim();
    if (!/^[0-7]*$/.test(value)) throw new Error('Unsupported tar numeric header');
    return parseInt(value || '0', 8);
  };
  function pax(buffer) {
    const fields = {};
    let at = 0;
    while (at < buffer.length) {
      const space = buffer.indexOf(32, at);
      if (space < 0) throw new Error('Invalid extended tar header');
      const length = Number(buffer.subarray(at, space).toString());
      if (!Number.isInteger(length) || length < 5 || at + length > buffer.length)
        throw new Error('Invalid extended tar length');
      const pair = buffer.subarray(space + 1, at + length - 1).toString('utf8');
      const eq = pair.indexOf('=');
      if (eq < 0) throw new Error('Invalid extended tar field');
      fields[pair.slice(0, eq)] = pair.slice(eq + 1);
      at += length;
    }
    return fields;
  }
  while (offset + 512 <= data.length) {
    const header = data.subarray(offset, offset + 512);
    offset += 512;
    if (header.every(b => b === 0)) break;
    if (++count > 100000) throw new Error('Archive contains too many entries');
    const expected = number(header.subarray(148, 156));
    let total = 0;
    for (let i = 0; i < 512; i++) total += i >= 148 && i < 156 ? 32 : header[i];
    if (total !== expected) throw new Error('Invalid tar checksum');
    const size = number(header.subarray(124, 136)),
      type = String.fromCharCode(header[156] || 48);
    if (offset + size > data.length) throw new Error('Truncated archive');
    const content = data.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;
    if (type === 'x') {
      extended = pax(content);
      continue;
    }
    if (type === 'g') {
      global = { ...global, ...pax(content) };
      continue;
    }
    if (type === 'L') {
      longName = string(content).replace(/\n$/, '');
      continue;
    }
    const prefix = string(header.subarray(345, 500));
    let name =
      extended.path ||
      global.path ||
      longName ||
      (prefix ? prefix + '/' : '') + string(header.subarray(0, 100));
    extended = {};
    longName = null;
    name = name.replace(/\/$/, '');
    if (!name) continue;
    safePath(name);
    if (stripRoot) {
      const slash = name.indexOf('/');
      if (slash < 0) continue;
      name = name.slice(slash + 1);
    }
    if (!name || !select(name)) continue;
    if (type === '5') continue;
    if (type !== '0') throw new Error('Selected archive entry is not a regular file');
    if (out.has(name)) throw new Error('Duplicate archive path');
    if (size > 32 * 1024 * 1024) throw new Error('Selected archive file exceeds limit');
    out.set(name, Buffer.from(content));
  }
  if (!out.size) throw new Error('Archive contains no approved files');
  return out;
}
