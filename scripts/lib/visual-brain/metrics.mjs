import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {at,mkdir,noSymlinks} from '../core.mjs';
const DAY=86400000;
const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
let connection;
export async function database(){
  if(connection)return connection;
  const directory=at('.state/visual-brain'),file=at('.state/visual-brain/activity.sqlite');
  noSymlinks(at('.state'),directory);mkdir(directory,0o700);noSymlinks(directory,file);
  // Precreate privately before SQLite opens; do not chmod or replace unknown data.
  try{fs.closeSync(fs.openSync(file,'wx',0o600));}catch(error){if(error.code!=='EEXIST')throw error;}
  if(fs.statSync(directory).mode&0o077||fs.statSync(file).mode&0o077)throw new Error('Activity storage permissions are too broad');
  const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(file);
  db.exec('PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');
  const version=db.prepare('PRAGMA user_version').get().user_version;
  if(version>1){db.close();throw new Error('Activity database version is newer than this application');}
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, snapshot TEXT NOT NULL, started INTEGER NOT NULL, completed INTEGER);
    CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT UNIQUE NOT NULL,dedupe TEXT UNIQUE NOT NULL,session TEXT NOT NULL REFERENCES sessions(id),node TEXT NOT NULL,type TEXT NOT NULL,at INTEGER NOT NULL,origin TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS daily (day TEXT NOT NULL,node TEXT NOT NULL,type TEXT NOT NULL,count INTEGER NOT NULL,last INTEGER NOT NULL,PRIMARY KEY(day,node,type));
    CREATE INDEX IF NOT EXISTS events_at ON events(at); PRAGMA user_version=1;`);
  connection=db;return db;
}
export async function startSession(snapshot){const db=await database(),id=randomUUID();db.prepare('INSERT INTO sessions(id,snapshot,started) VALUES(?,?,?)').run(id,snapshot,Date.now());return {session:id,snapshot};}
export async function sessionInfo(id){if(typeof id!=='string'||!/^[-a-f0-9]{36}$/.test(id))throw new Error('Invalid activity session');const s=(await database()).prepare('SELECT * FROM sessions WHERE id=?').get(id);if(!s)throw new Error('Unknown activity session');return s;}
export async function record({session,node='',type,eventId,origin='agent'}) {
  const db=await database();const s=await sessionInfo(session);const now=Date.now();
  if(!['search','no-results','returned','planned','read','cited','complete'].includes(type)||!['agent','viewer','cli'].includes(origin))throw new Error('Invalid activity event');
  if(typeof eventId!=='string'||!/^[-a-f0-9]{36}$/.test(eventId)||typeof node!=='string'||node.length>2048)throw new Error('Invalid activity identifiers');
  const dedupe=['read','cited','complete'].includes(type)?`${session}|${node}|${type}`:eventId;
  db.exec('BEGIN IMMEDIATE');
  try{
    const prior=db.prepare('SELECT id,dedupe FROM events WHERE id=? OR dedupe=?').get(eventId,dedupe);
    if(prior){db.exec('COMMIT');return {recorded:false,duplicate:true};}
    const current=db.prepare('SELECT started,completed FROM sessions WHERE id=?').get(session);
    if(now-current.started>DAY||current.completed)throw new Error('Activity session has expired or completed');
    db.prepare('INSERT INTO events(id,dedupe,session,node,type,at,origin) VALUES(?,?,?,?,?,?,?)').run(eventId,dedupe,session,node,type,now,origin);
    if(type!=='planned'&&type!=='complete')db.prepare(`INSERT INTO daily(day,node,type,count,last) VALUES(?,?,?,1,?) ON CONFLICT(day,node,type) DO UPDATE SET count=count+1,last=excluded.last`).run(day(now),node,type,now);
    if(type==='complete')db.prepare('UPDATE sessions SET completed=? WHERE id=?').run(now,session);
    // Daily totals are updated in the same transaction as insertion, before pruning.
    db.prepare('DELETE FROM events WHERE at < ?').run(now-30*DAY);
    db.prepare('DELETE FROM sessions WHERE started < ? AND id NOT IN (SELECT session FROM events)').run(now-30*DAY);
    db.exec('COMMIT');return {recorded:true,eventId};
  }catch(error){db.exec('ROLLBACK');throw error;}
}
export async function summary(period='today'){
  if(!['today','week','all'].includes(period))throw new Error('Unknown metrics period');
  const db=await database(),since=period==='today'?day(Date.now()):period==='week'?new Date(Date.parse(day(Date.now())+'T12:00:00Z')-6*DAY).toISOString().slice(0,10):'0000-00-00';
  const rows=db.prepare('SELECT node,type,SUM(count) AS count,MAX(last) AS last FROM daily WHERE day>=? GROUP BY node,type').all(since);
  const totals={search:0,'no-results':0,returned:0,read:0,cited:0},nodes={};
  for(const row of rows){totals[row.type]=(totals[row.type]||0)+row.count;if(row.node){nodes[row.node]??={returned:0,read:0,cited:0,lastUsed:0};nodes[row.node][row.type]=row.count;nodes[row.node].lastUsed=Math.max(nodes[row.node].lastUsed,row.last);}}
  const sessions=db.prepare('SELECT id,snapshot,started,completed FROM sessions ORDER BY started DESC LIMIT 20').all().map(s=>({...s,status:s.completed?'completed':Date.now()-s.started>DAY?'interrupted':'active'}));
  const recent=db.prepare('SELECT e.session,e.node,e.type,e.at,e.origin,s.snapshot FROM events e JOIN sessions s ON s.id=e.session ORDER BY e.seq DESC LIMIT 20').all();
  return {recent,period,timezone:'America/New_York',totals,nodes,sessions,firstRecorded:db.prepare('SELECT MIN(day) AS day FROM daily').get().day};
}
export async function eventsAfter(seq=0){const db=await database();return db.prepare('SELECT e.seq,e.session,e.node,e.type,e.at,e.origin,s.snapshot FROM events e JOIN sessions s ON s.id=e.session WHERE e.seq>? ORDER BY e.seq LIMIT 500').all(seq);}
export async function latestSequence(){return (await database()).prepare('SELECT COALESCE(MAX(seq),0) AS seq FROM events').get().seq;}
export async function captureLookup(results,{session,snapshot,origin='cli',resultCount=results.length}={}){
  const id=session||(await startSession(snapshot)).session;const lookupId=randomUUID();
  await record({session:id,type:'search',eventId:lookupId,origin});
  if(!resultCount)await record({session:id,type:'no-results',eventId:randomUUID(),origin});
  const nodes=[...new Set(results.map(r=>r.id).filter(Boolean))];
  for(const node of nodes)await record({session:id,type:'returned',node,eventId:randomUUID(),origin});
  for(let i=0;i<resultCount-nodes.length;i++)await record({session:id,type:'returned',eventId:randomUUID(),origin});
  return id;
}
export function metricsWarning(){console.error('brain: activity metrics were not recorded; retrieval remains available. Check local activity storage.');}
