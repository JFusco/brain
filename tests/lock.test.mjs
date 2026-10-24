import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { withLock } from '../scripts/lib/branch/platform/lock.mjs';
import { temporary } from './helpers.mjs';

const deadPid = () => spawnSync(process.execPath, ['-e', '']).pid;

test('holds the lock for the duration of the work and releases it', async t => {
  const file = path.join(temporary(t), 'mutation.lock');
  const result = await withLock(
    () => {
      assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).pid, process.pid);
      return 'done';
    },
    { file },
  );
  assert.equal(result, 'done');
  assert.equal(fs.existsSync(file), false);
});

test('a live owner blocks a second mutation, which leaves the lock intact', async t => {
  const file = path.join(temporary(t), 'mutation.lock');
  await withLock(
    async () => {
      await assert.rejects(
        withLock(() => 'second', { file }),
        /Another brain mutation is running/,
      );
      assert.equal(fs.existsSync(file), true);
    },
    { file },
  );
  assert.equal(fs.existsSync(file), false);
});

test('a stale or unreadable lock is taken over', async t => {
  const directory = temporary(t);
  const file = path.join(directory, 'mutation.lock');
  fs.writeFileSync(file, JSON.stringify({ pid: deadPid(), startedAt: 'then' }));
  assert.equal(await withLock(() => 'took over', { file }), 'took over');
  fs.writeFileSync(file, '');
  assert.equal(await withLock(() => 'took over again', { file }), 'took over again');
});

test('releasing never removes a lock another process now owns', async t => {
  const file = path.join(temporary(t), 'mutation.lock');
  const foreign = JSON.stringify({ pid: process.pid, startedAt: 'elsewhere' });
  await withLock(() => fs.writeFileSync(file, foreign), { file });
  assert.equal(fs.readFileSync(file, 'utf8'), foreign);
});

// Racing processes on a stale lock: exactly one may hold it at a time.
test('concurrent takeovers of a stale lock admit one owner', async t => {
  const directory = temporary(t);
  const file = path.join(directory, 'mutation.lock');
  const racer = path.join(directory, 'racer.mjs');
  const lockModule = new URL('../scripts/lib/branch/platform/lock.mjs', import.meta.url).href;
  fs.writeFileSync(
    racer,
    `import fs from 'node:fs';
import { withLock } from ${JSON.stringify(lockModule)};
const [file, log] = process.argv.slice(2);
try {
  await withLock(async () => {
    fs.appendFileSync(log, 'in\\n');
    await new Promise(resolve => setTimeout(resolve, 150));
    fs.appendFileSync(log, 'out\\n');
  }, { file });
} catch (error) {
  if (!/Another brain mutation is running/.test(error.message)) throw error;
}
`,
  );
  const { spawn } = await import('node:child_process');
  for (let trial = 0; trial < 8; trial++) {
    const log = path.join(directory, `trial-${trial}.log`);
    fs.writeFileSync(file, JSON.stringify({ pid: deadPid(), startedAt: 'then' }));
    const exits = await Promise.all(
      Array.from({ length: 8 }, () => {
        const child = spawn(process.execPath, [racer, file, log], { stdio: 'inherit' });
        return new Promise(resolve => child.on('exit', resolve));
      }),
    );
    assert.deepEqual(exits, Array(8).fill(0));
    let held = 0;
    let maximum = 0;
    for (const line of fs.readFileSync(log, 'utf8').trim().split('\n')) {
      held += line === 'in' ? 1 : -1;
      maximum = Math.max(maximum, held);
    }
    assert.equal(maximum, 1, `trial ${trial}: concurrent owners`);
  }
});
