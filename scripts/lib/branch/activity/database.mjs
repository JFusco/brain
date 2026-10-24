import fs from 'node:fs';
import { mkdir, noSymlinks } from '../../leaf/fs-safe.mjs';
import { at } from '../../leaf/paths.mjs';

// Private local activity store (SQLite under .state/visual-brain). Never shared or uploaded.
export const day = value =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
let connection;
export async function database() {
  if (connection) return connection;
  const directory = at('.state/visual-brain'),
    file = at('.state/visual-brain/activity.sqlite');
  noSymlinks(at('.state'), directory);
  mkdir(directory, 0o700);
  noSymlinks(directory, file);
  // Precreate privately before SQLite opens; do not chmod or replace unknown data.
  try {
    fs.closeSync(fs.openSync(file, 'wx', 0o600));
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  if (fs.statSync(directory).mode & 0o077 || fs.statSync(file).mode & 0o077)
    throw new Error('Activity storage permissions are too broad');
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(file);
  db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
  const version = db.prepare('PRAGMA user_version').get().user_version;
  if (version > 1) {
    db.close();
    throw new Error('Activity database version is newer than this application');
  }
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, snapshot TEXT NOT NULL, started INTEGER NOT NULL, completed INTEGER);
    CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT UNIQUE NOT NULL,dedupe TEXT UNIQUE NOT NULL,session TEXT NOT NULL REFERENCES sessions(id),node TEXT NOT NULL,type TEXT NOT NULL,at INTEGER NOT NULL,origin TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS daily (day TEXT NOT NULL,node TEXT NOT NULL,type TEXT NOT NULL,count INTEGER NOT NULL,last INTEGER NOT NULL,PRIMARY KEY(day,node,type));
    CREATE INDEX IF NOT EXISTS events_at ON events(at); PRAGMA user_version=1;`);
  connection = db;
  return db;
}
