import https from 'node:https';
import { lookup } from './dns.mjs';

export function download(
  input,
  { hosts, maxBytes = 64 * 1024 * 1024, headers = {}, redirects = 0 } = {},
) {
  const url = new URL(input);
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443') ||
    !hosts?.includes(url.hostname)
  )
    throw new Error('URL outside approved HTTPS hosts');
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = error => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };
    const request = https.get(
      url,
      { lookup, headers: { 'user-agent': 'personal-brain/1.0', ...headers }, timeout: 30000 },
      response => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          response.resume();
          if (redirects >= 5) return fail(new Error('Too many redirects'));
          try {
            const next = new URL(response.headers.location, url);
            const nextHeaders = { ...headers };
            if (next.hostname !== url.hostname) delete nextHeaders.authorization;
            const pending = download(next.href, {
              hosts,
              maxBytes,
              headers: nextHeaders,
              redirects: redirects + 1,
            });
            settled = true;
            return resolve(pending);
          } catch (error) {
            return fail(error);
          }
        }
        if (response.statusCode !== 200) {
          response.resume();
          return fail(new Error(`HTTP ${response.statusCode} from ${url.hostname}`));
        }
        if (Number(response.headers['content-length'] || 0) > maxBytes) {
          response.destroy();
          return fail(new Error('Download exceeds size limit'));
        }
        const chunks = [];
        let size = 0;
        response.on('data', chunk => {
          size += chunk.length;
          if (size > maxBytes) {
            response.destroy();
            fail(new Error('Download exceeds size limit'));
          } else chunks.push(chunk);
        });
        response.on('end', () => {
          if (!settled) {
            settled = true;
            resolve({ bytes: Buffer.concat(chunks), url: url.href, headers: response.headers });
          }
        });
        response.on('error', fail);
      },
    );
    const deadline = setTimeout(
      () => request.destroy(new Error('Download deadline exceeded')),
      120000,
    );
    request.on('close', () => clearTimeout(deadline));
    request.on('timeout', () => request.destroy(new Error('Download timed out')));
    request.on('error', fail);
  });
}
export function markdownResponse(response) {
  const text = response.bytes.toString('utf8');
  const type = String(response.headers['content-type'] || '').toLowerCase();
  if (
    !text.trim() ||
    type.includes('text/html') ||
    /^\s*(?:<!doctype html|<html[\s>]|<body[\s>])/i.test(text) ||
    /^(?:\s|[#>])*(?:just a moment|sign in to continue)/i.test(text)
  )
    throw new Error('Expected text documentation; received HTML or a challenge');
  if (text.includes('\0')) throw new Error('Unexpected binary documentation');
  return text;
}
