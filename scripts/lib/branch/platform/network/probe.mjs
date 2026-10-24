import https from 'node:https';
import { lookup } from './dns.mjs';

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
