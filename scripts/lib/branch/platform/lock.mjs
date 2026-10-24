import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { at } from '../../leaf/paths.mjs';
import { mkdir } from '../../leaf/fs-safe.mjs';
import { now } from '../../leaf/time.mjs';

const ATTEMPTS = 40;
const BREAKER_EXPIRY = 30000;
const pause = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const readText = file => {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

function ownerPid(text) {
  try {
    return Number(JSON.parse(text).pid) || 0;
  } catch {
    return 0; // Unreadable owner record: treat as stale.
  }
}

// EPERM means the process exists under another user, so it still owns the lock.
function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === 'ESRCH') return false;
    if (error.code === 'EPERM') return true;
    throw error;
  }
}

// Link a complete temporary file into place so readers never see a partial record.
function acquire(file) {
  mkdir(path.dirname(file), 0o700);
  const record = JSON.stringify({ pid: process.pid, startedAt: now(), token: crypto.randomUUID() });
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const temporary = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(temporary, record, { mode: 0o600, flag: 'wx' });
    try {
      fs.linkSync(temporary, file);
      return record;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    } finally {
      fs.rmSync(temporary, { force: true });
    }
    const existing = readText(file);
    if (existing === null) continue;
    const pid = ownerPid(existing);
    if (pid && alive(pid)) throw new Error('Another brain mutation is running');
    if (!breakStale(file, existing)) pause(25);
  }
  throw new Error('Could not acquire the brain mutation lock');
}

// Only one process may remove a stale record, and only the record it inspected.
// The breaker file serializes that check-and-remove; a crashed breaker expires.
function breakStale(file, existing) {
  const breaker = `${file}.break`;
  let descriptor;
  try {
    descriptor = fs.openSync(breaker, 'wx', 0o600);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    try {
      if (Date.now() - fs.statSync(breaker).mtimeMs > BREAKER_EXPIRY)
        fs.rmSync(breaker, { force: true });
    } catch (statError) {
      if (statError.code !== 'ENOENT') throw statError;
    }
    return false;
  }
  try {
    if (readText(file) === existing) fs.rmSync(file, { force: true });
    return true;
  } finally {
    fs.closeSync(descriptor);
    fs.rmSync(breaker, { force: true });
  }
}

export function withLock(fn, { file = at('.state/mutation.lock') } = {}) {
  return (async () => {
    const record = acquire(file);
    try {
      return await fn();
    } finally {
      if (readText(file) === record) fs.rmSync(file, { force: true });
    }
  })();
}
