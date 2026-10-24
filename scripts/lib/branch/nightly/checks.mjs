import { spawnSync } from 'node:child_process';
import { writeJSON } from '../../leaf/fs-safe.mjs';
import { sha } from '../../leaf/hash.mjs';
import { now } from '../../leaf/time.mjs';
import { privateFile } from './paths.mjs';
import { cleanHead } from './run.mjs';

// Stored receipts compare these exact command strings; changing them invalidates prior receipts.
export const CHECKS = [
  'node scripts/brain.mjs check',
  'node scripts/brain.mjs official check',
  'node scripts/wiki/check.cjs',
];
export function checks(worktree, head) {
  const results = [];
  for (const command of CHECKS) {
    const startedAt = now(),
      r = spawnSync(process.execPath, command.split(' ').slice(1), {
        cwd: worktree,
        maxBuffer: 32 * 1024 * 1024,
        timeout: 180000,
      });
    const record = {
      command,
      headSha: head,
      startedAt,
      completedAt: now(),
      exitCode: r.status,
      output: Buffer.concat([r.stdout || Buffer.alloc(0), r.stderr || Buffer.alloc(0)]).toString(),
    };
    results.push(record);
    writeJSON(privateFile(`checks/${sha(worktree)}/${head}-${process.pid}.json`), results, 0o600);
    if (r.status !== 0)
      throw new Error(`Local check failed: ${command}; diagnostics retained privately`);
    if (cleanHead(worktree) !== head)
      throw new Error('Checked content changed during verification');
  }
  return results;
}
