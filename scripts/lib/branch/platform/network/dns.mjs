import https from 'node:https';
import dns from 'node:dns';
import { config } from '../config.mjs';

// DNS with a configured DNS-over-HTTPS fallback; resolved addresses are cached per process.
const addresses = new Map();
export function lookup(host, options, done) {
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
