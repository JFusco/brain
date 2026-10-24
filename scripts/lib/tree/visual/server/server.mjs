import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { noSymlinks } from '../../../leaf/fs-safe.mjs';
import { at } from '../../../leaf/paths.mjs';
import { snapshot } from '../../../branch/visual/snapshot/snapshot.mjs';
import { getApi } from './api-get.mjs';
import { postApi } from './api-post.mjs';
import { isLocalRequest } from './request.mjs';
import { serveAsset } from './static.mjs';

const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

export async function serve({ port = 4174 } = {}) {
  port = Number(port);
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('Port must be between 1024 and 65535');
  const assets = at('web/brain/dist');
  noSymlinks(at('web/brain'), assets);
  if (!fs.existsSync(path.join(assets, 'index.html')))
    throw new Error(
      'Build the viewer first: pnpm --dir web/brain install --frozen-lockfile && pnpm --dir web/brain run build',
    );
  const graph = snapshot();
  console.log(`Knowledge snapshot ${graph.revision.slice(0, 12)}; ${graph.nodes.length} nodes`);
  const origin = `http://127.0.0.1:${port}`;
  const sockets = new Set();
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', CSP);
    const send = (code, data) => {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    };
    try {
      if (!isLocalRequest(req.headers, port, origin))
        return send(403, { error: 'Local same-origin access only' });
      const url = new URL(req.url, origin);
      if (await getApi(req, res, url, send)) return;
      if (await postApi(req, url, origin, send)) return;
      if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });
      if (url.pathname.startsWith('/api/')) return send(404, { error: 'Unknown endpoint' });
      serveAsset(res, assets, url, send);
    } catch {
      if (!res.headersSent)
        send(400, { error: 'Request failed; check inputs and local activity storage' });
      else res.end();
    }
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  console.log(`Visual Brain → ${origin}/`);
  function stop() {
    for (const socket of sockets) socket.destroy();
    server.close();
  }
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return new Promise(resolve => server.once('close', () => resolve({ ok: true })));
}
