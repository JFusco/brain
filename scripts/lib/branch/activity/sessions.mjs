import { randomUUID } from 'node:crypto';
import { database } from './database.mjs';

export async function startSession(snapshot) {
  const db = await database(),
    id = randomUUID();
  db.prepare('INSERT INTO sessions(id,snapshot,started) VALUES(?,?,?)').run(
    id,
    snapshot,
    Date.now(),
  );
  return { session: id, snapshot };
}
export async function sessionInfo(id) {
  if (typeof id !== 'string' || !/^[-a-f0-9]{36}$/.test(id))
    throw new Error('Invalid activity session');
  const s = (await database()).prepare('SELECT * FROM sessions WHERE id=?').get(id);
  if (!s) throw new Error('Unknown activity session');
  return s;
}
