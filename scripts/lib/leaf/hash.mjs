import crypto from 'node:crypto';

export const sha = value => crypto.createHash('sha256').update(value).digest('hex');

// Git's blob object ID, so fetched repository files can be checked against pinned catalogs.
export const gitBlob = bytes =>
  crypto.createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
