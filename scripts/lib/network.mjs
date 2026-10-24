import https from 'node:https';
import dns from 'node:dns';
import { spawnSync } from 'node:child_process';
import { config } from './core.mjs';

const addresses = new Map();
function lookup(host, options, done) {
  dns.lookup(host, options, (error, address, family) => {
    if (!error) return done(null, address, family);
    const fallback = config().network?.dnsFallback;
    if (!fallback) return done(error);
    const finish = ip =>
      options?.all ? done(null, [{ address: ip, family: 4 }]) : done(null, ip, 4);
    if (addresses.has(host)) return finish(addresses.get(host));
    const endpoint = new URL(fallback);
    endpoint.searchParams.set('name', host);
    endpoint.searchParams.set('type', 'A');
    const request = https.get(
      endpoint,
      { headers: { accept: 'application/dns-json' }, timeout: 10000 },
      response => {
        const chunks = [];
        let count = 0;
        response.on('data', b => {
          count += b.length;
          if (count > 65536) response.destroy();
          else chunks.push(b);
        });
        response.on('end', () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks));
            const ip = data.Answer?.find(x => x.type === 1)?.data;
            if (!ip) throw error;
            addresses.set(host, ip);
            finish(ip);
          } catch {
            done(error);
          }
        });
        response.on('error', () => done(error));
      },
    );
    request.on('timeout', () => request.destroy(new Error('DNS timeout')));
    request.on('error', () => done(error));
  });
}
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
let token;
export async function api(route) {
  if (!/^repos\/[\w.-]+\/[\w.-]+(?:\/[^\s?#]*)?(?:\?[^\s]*)?$/.test(route))
    throw new Error('Invalid repository API route');
  if (token === undefined) {
    const result = spawnSync(config().toolchain.gh, ['auth', 'token'], {
      encoding: 'utf8',
      timeout: 10000,
    });
    token = result.status === 0 ? result.stdout.trim() : '';
  }
  const response = await download('https://api.github.com/' + route, {
    hosts: ['api.github.com'],
    maxBytes: 16 * 1024 * 1024,
    headers: {
      accept: 'application/vnd.github+json',
      ...(token ? { authorization: 'Bearer ' + token } : {}),
    },
  });
  return JSON.parse(response.bytes);
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

// Header-only availability checks. Never retain or consume a response body.
export function probe(input, { hosts, method = 'HEAD', trail = [] } = {}) {
  const url = new URL(input),
    display = value => {
      const clean = new URL(value);
      clean.search = '';
      clean.hash = '';
      return clean.href;
    };
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443') ||
    !hosts?.includes(url.hostname)
  )
    throw new Error('Link probe outside approved HTTPS hosts');
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = value => {
      if (!finished) {
        finished = true;
        resolve(value);
      }
    };
    const request = https.request(
      url,
      {
        method,
        lookup,
        headers: {
          'user-agent': 'personal-brain/1.0',
          accept: 'text/markdown, text/plain;q=0.9, text/html;q=0.5',
          ...(method === 'GET' ? { range: 'bytes=0-0' } : {}),
        },
        timeout: 8000,
      },
      response => {
        const status = response.statusCode;
        response.destroy();
        if ([301, 302, 303, 307, 308].includes(status)) {
          try {
            const next = new URL(response.headers.location, url),
              redirects = [...trail, { status, from: display(url), to: display(next) }];
            if (
              next.protocol !== 'https:' ||
              next.username ||
              next.password ||
              (next.port && next.port !== '443') ||
              !hosts.includes(next.hostname)
            )
              return finish({
                status,
                finalUrl: display(url),
                redirects,
                state: 'blocked-redirect',
              });
            if (trail.length >= 5)
              return finish({ status, finalUrl: display(url), redirects, state: 'redirect-loop' });
            finished = true;
            return resolve(probe(next.href, { hosts, method, trail: redirects }));
          } catch {
            return finish({
              status,
              finalUrl: display(url),
              redirects: trail,
              state: 'invalid-redirect',
            });
          }
        }
        // Some public documentation endpoints reject HEAD but serve ordinary GET.
        if (method === 'HEAD' && [403, 405, 501].includes(status)) {
          finished = true;
          return resolve(
            probe(url.href, { hosts, method: 'GET', trail }).then(result => ({
              ...result,
              headStatus: status,
            })),
          );
        }
        finish({
          status,
          method,
          finalUrl: display(url),
          redirects: trail,
          retryAfter: response.headers['retry-after'] || null,
        });
      },
    );
    const deadline = setTimeout(
      () => request.destroy(new Error('Link probe deadline exceeded')),
      12000,
    );
    request.on('close', () => clearTimeout(deadline));
    request.on('timeout', () => request.destroy(new Error('Link probe timed out')));
    request.on('error', error => {
      if (!finished) {
        finished = true;
        reject(error);
      }
    });
    request.end();
  });
}
