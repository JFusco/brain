import { spawnSync } from 'node:child_process';
import { config } from '../config.mjs';
import { download } from './download.mjs';

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
