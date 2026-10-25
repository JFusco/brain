import { gunzipSync } from 'node:zlib';

// HTTP encoding and gzip sitemap files are independent of a URL's extension.
export function documentationBytes(response, input, maxExpandedBytes) {
  const encoding = String(response.headers['content-encoding'] || '')
    .trim()
    .toLowerCase();
  if (encoding && !['identity', 'gzip', 'x-gzip'].includes(encoding))
    throw new Error('Unsupported documentation content encoding');
  const compressedHttp = encoding === 'gzip' || encoding === 'x-gzip';
  const expand = bytes => gunzipSync(bytes, { maxOutputLength: maxExpandedBytes });
  let bytes = compressedHttp ? expand(response.bytes) : response.bytes;
  const gzipBytes = bytes[0] === 0x1f && bytes[1] === 0x8b;
  const gzipUrl = /\.gz(?:$|\?)/.test(response.url || input);
  if (gzipBytes || (!compressedHttp && gzipUrl)) bytes = expand(bytes);
  return bytes;
}
