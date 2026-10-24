#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { config } from './lib/branch/platform/config.mjs';
import { withLock } from './lib/branch/platform/lock.mjs';
import { writeJSON, atomic, mkdir } from './lib/leaf/fs-safe.mjs';
import { sha } from './lib/leaf/hash.mjs';
import { readJSON } from './lib/leaf/json.mjs';
import { at } from './lib/leaf/paths.mjs';
import { api, download } from './lib/network.mjs';
import { archive } from './lib/archive.mjs';

await withLock(async () => {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error('Node 24 is required');
  const c = config(),
    local = readJSON(at('brain.config.local.json'));
  if (!c.toolchain.gitleaks || !fs.existsSync(c.toolchain.gitleaks)) {
    const release = await api('repos/gitleaks/gitleaks/releases/latest');
    const version = release.tag_name.replace(/^v/, ''),
      arch = process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'x64' : null;
    if (process.platform !== 'darwin' || !arch)
      throw new Error('Bootstrap supports macOS arm64/x64');
    const name = `gitleaks_${version}_darwin_${arch}.tar.gz`;
    const asset = release.assets.find(a => a.name === name),
      checks = release.assets.find(a => /checksums\.txt$/.test(a.name));
    if (!asset || !checks) throw new Error('Official scanner release assets are missing');
    const hosts = [
      'github.com',
      'release-assets.githubusercontent.com',
      'objects.githubusercontent.com',
    ];
    const [packageResponse, checksumResponse] = await Promise.all([
      download(asset.browser_download_url, { hosts }),
      download(checks.browser_download_url, { hosts, maxBytes: 1024 * 1024 }),
    ]);
    const expected = checksumResponse.bytes
      .toString()
      .split('\n')
      .map(line => line.trim().split(/\s+/))
      .find(parts => parts[1]?.replace(/^\*/, '') === name)?.[0];
    if (!expected || sha(packageResponse.bytes) !== expected)
      throw new Error('Scanner archive checksum does not match');
    const files = archive(packageResponse.bytes, {
      stripRoot: false,
      select: name => ['gitleaks', 'LICENSE', 'LICENSE.txt'].includes(name),
    });
    if (!files.has('gitleaks')) throw new Error('Scanner archive has no binary');
    const dir = at(`.state/tools/gitleaks/${version}`);
    mkdir(dir, 0o700);
    for (const [name, bytes] of files)
      atomic(path.join(dir, name), bytes, name === 'gitleaks' ? 0o700 : 0o600);
    const binary = path.join(dir, 'gitleaks');
    const output = spawnSync(binary, ['version'], { encoding: 'utf8', timeout: 10000 });
    if (output.status !== 0 || output.stdout.trim().replace(/^v/, '') !== version)
      throw new Error('Downloaded scanner did not report the expected version');
    local.toolchain = {
      ...local.toolchain,
      gitleaks: binary,
      gitleaksVersion: version,
      gitleaksBinarySha256: sha(files.get('gitleaks')),
    };
    writeJSON(at('brain.config.local.json'), local, 0o600);
    const lock = readJSON(at('official/sources.lock.json'), {
      schemaVersion: 2,
      sources: {},
      toolchain: {},
    });
    lock.toolchain = {
      gitleaks: {
        version,
        archiveSha256: expected,
        binarySha256: local.toolchain.gitleaksBinarySha256,
        url: asset.browser_download_url,
        license: 'MIT',
      },
    };
    writeJSON(at('official/sources.lock.json'), lock);
    console.log(`Installed checksum-verified Gitleaks ${version} privately inside the brain.`);
  }
});
