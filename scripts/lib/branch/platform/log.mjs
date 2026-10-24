import fs from 'node:fs';
import path from 'node:path';
import { at } from '../../leaf/paths.mjs';
import { mkdir } from '../../leaf/fs-safe.mjs';
import { DAY, now } from '../../leaf/time.mjs';

export function log(event, details = {}) {
  const dir = at('.state/logs');
  mkdir(dir, 0o700);
  const file = path.join(dir, now().slice(0, 10) + '.jsonl');
  fs.appendFileSync(file, JSON.stringify({ at: now(), event, ...details }) + '\n', { mode: 0o600 });
  for (const old of fs.readdirSync(dir))
    if (
      /^\d{4}-\d\d-\d\d\.jsonl$/.test(old) &&
      Date.now() - Date.parse(old.slice(0, 10)) > 30 * DAY
    )
      fs.rmSync(path.join(dir, old));
}
