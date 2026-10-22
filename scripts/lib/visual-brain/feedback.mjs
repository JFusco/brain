import {database} from './metrics.mjs';
import {snapshot as readSnapshot} from './snapshot.mjs';
const values=['helped','needs-clarification','did-not-apply'];
export async function feedback({node,snapshot,value}={}){
  const graph=readSnapshot();if(snapshot!==graph.revision)throw new Error('Knowledge changed; refresh before recording feedback');
  const note=graph.nodes.find(n=>n.id===node&&n.kind==='curated-note');if(!note)throw new Error('Choose a published knowledge note');
  if(value!==undefined&&![...values,'clear'].includes(value))throw new Error('Choose helped, needs-clarification, did-not-apply or clear');
  const db=await database();
  if(readSnapshot().revision!==snapshot)throw new Error('Knowledge changed; refresh before recording feedback');
  // Additive table: older readers can still read activity; no existing data is reset.
  db.exec('CREATE TABLE IF NOT EXISTS feedback (node TEXT NOT NULL, content TEXT NOT NULL, value TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(node,content))');
  if(value!==undefined){
    db.exec('BEGIN IMMEDIATE');
    try{
      if(value==='clear')db.prepare('DELETE FROM feedback WHERE node=? AND content=?').run(node,note.sha256);
      else {
        const prior=db.prepare('SELECT value FROM feedback WHERE node=? AND content=?').get(node,note.sha256);
        if(!prior&&db.prepare('SELECT COUNT(*) AS count FROM feedback').get().count>=10000)throw new Error('Local feedback storage is full; clear an existing response first');
        if(prior?.value!==value)db.prepare('INSERT INTO feedback(node,content,value,updated) VALUES(?,?,?,?) ON CONFLICT(node,content) DO UPDATE SET value=excluded.value,updated=excluded.updated').run(node,note.sha256,value,Date.now());
      }
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error;}
  }
  const saved=db.prepare('SELECT value,updated FROM feedback WHERE node=? AND content=?').get(node,note.sha256);
  return {snapshot:graph.revision,node,contentSha256:note.sha256,value:saved?.value||null,updatedAt:saved?new Date(saved.updated).toISOString():null,notice:'One private local response per note version. Repeated choices do not add votes. Feedback does not alter ranking, publish knowledge or verify a claim.'};
}
