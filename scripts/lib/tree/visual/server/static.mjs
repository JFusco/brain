import fs from 'node:fs';
import path from 'node:path';
import { noSymlinks } from '../../../leaf/fs-safe.mjs';
import { assetFile, TYPES } from './request.mjs';

// Built viewer assets only, by allowlisted name, never through a symlink.
export function serveAsset(res, assets, url, send) {
  const file = assetFile(url.pathname);
  if (!file) return send(404, { error: 'Unknown asset' });
  const full = path.join(assets, file);
  noSymlinks(assets, full);
  if (!fs.existsSync(full)) return send(404, { error: 'Unknown asset' });
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] });
  fs.createReadStream(full).pipe(res);
}
