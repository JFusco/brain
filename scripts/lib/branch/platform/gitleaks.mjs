import { archive } from './archive.mjs';

// Official Gitleaks release hosts and the only files Brain takes from a release archive.
export const GITLEAKS_HOSTS = [
  'github.com',
  'release-assets.githubusercontent.com',
  'objects.githubusercontent.com',
];
const SCANNER_FILES = ['gitleaks', 'LICENSE', 'LICENSE.txt'];

// The SHA-256 a release checksum file lists for one asset, or undefined.
export const checksumFor = (text, name) =>
  text
    .split('\n')
    .map(line => line.trim().split(/\s+/))
    .find(parts => parts[1]?.replace(/^\*/, '') === name)?.[0];

export const scannerFiles = bytes =>
  archive(bytes, { stripRoot: false, select: name => SCANNER_FILES.includes(name) });
