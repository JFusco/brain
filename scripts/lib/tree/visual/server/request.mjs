// Request guards for the loopback viewer server.
export const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};
export async function body(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (Buffer.byteLength(data) > 8192) throw new Error('Request body exceeds its bound');
  }
  return JSON.parse(data);
}
export function strict(value, keys) {
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    Object.keys(value).some(k => !keys.includes(k))
  )
    throw new Error('Unsupported request fields');
  return value;
}

// Loopback same-origin only: the exact host header, no foreign Origin, no cross-site fetch.
export const isLocalRequest = (headers, port, origin) =>
  headers.host === `127.0.0.1:${port}` &&
  (!headers.origin || headers.origin === origin) &&
  !['cross-site', 'same-site'].includes(headers['sec-fetch-site']);

const ASSET = /^(?:index\.html|assets\/[a-zA-Z0-9_.-]+\.(?:js|css|svg))$/;
// The built asset a GET path may serve, or null.
export function assetFile(pathname) {
  const file = pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1));
  return ASSET.test(file) ? file : null;
}
