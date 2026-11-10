import fs from 'node:fs';
/** A finite read, including the byte that proves oversize; never buffers the rest. */
export function boundedStdin(limit, fd = 0) {
  const chunks = [];
  let bytes = 0;
  while (bytes <= limit) {
    const chunk = Buffer.alloc(Math.min(65536, limit + 1 - bytes));
    const count = fs.readSync(fd, chunk, 0, chunk.length, null);
    if (!count) return Buffer.concat(chunks);
    chunks.push(chunk.subarray(0, count));
    bytes += count;
  }
  throw new Error('Input exceeds the byte limit');
}
