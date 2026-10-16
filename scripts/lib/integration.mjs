import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,at,config,sha,noSymlinks,inside,atomic,writeJSON,readJSON} from './core.mjs';
import {assertClean} from './privacy.mjs';

const privateDir='.brain-capture',manifestFile=`${privateDir}/installation.json`;
const base='.agents/brain-capture';
const allowed=new Set(['AGENTS.md','CLAUDE.md','.gitignore',`${base}/instructions.md`,`${base}/submit.mjs`,'.cursor/rules/brain-capture.mdc',`${privateDir}/config.json`,manifestFile]);
const begin='<!-- brain:capture:start -->',end='<!-- brain:capture:end -->';
const markers=name=>name==='.gitignore'?['# brain:capture:start','# brain:capture:end']:[begin,end];
function project(input) {
  if(!input)throw new Error('--project <path> is required');
  const root=fs.realpathSync(path.resolve(input));
  if(inside(ROOT,root))throw new Error('Do not enroll Brain itself');
  const git=spawnSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8',timeout:5000});
  if(git.status!==0||fs.realpathSync(git.stdout.trim())!==root)throw new Error('--project must select a Git repository root');
  const brainGit=spawnSync('git',['rev-parse','--path-format=absolute','--git-common-dir'],{cwd:ROOT,encoding:'utf8',timeout:5000});
  const targetGit=spawnSync('git',['rev-parse','--path-format=absolute','--git-common-dir'],{cwd:root,encoding:'utf8',timeout:5000});
  if(brainGit.status!==0||targetGit.status!==0||brainGit.stdout.trim()===targetGit.stdout.trim())throw new Error('Cannot enroll Brain or an associated worktree');
  return root;
}
function file(root,name) {
  if(!allowed.has(name))throw new Error('Path is outside capture integration management');
  const target=path.join(root,name);noSymlinks(root,target);return target;
}
function text(root,name) {
  const target=file(root,name);let stat;try{stat=fs.lstatSync(target);}catch(error){if(error.code==='ENOENT')return null;throw error;}
  if(!stat.isFile()||stat.size>1024*1024)throw new Error('Integration requires bounded regular files');
  if(name.startsWith(privateDir+'/')&&(stat.mode&0o077))throw new Error('Private integration permissions are too broad');
  return fs.readFileSync(target,'utf8');
}
function manifest(root) {
  const raw=text(root,manifestFile);if(raw===null)return null;
  let value;try{value=JSON.parse(raw);}catch{throw new Error('Invalid private integration manifest');}
  if(value.schemaVersion!==1||value.manager!=='brain-capture'||typeof value.installed!=='boolean'||!value.records||typeof value.records!=='object'||!Array.isArray(value.directories))throw new Error('Invalid private integration manifest');
  for(const [name,record]of Object.entries(value.records)){
    file(root,name);
    const [start,finish]=markers(name);
    if(name===manifestFile||!record||!['file','block'].includes(record.kind)||typeof record.created!=='boolean'||(record.kind==='file'&&!/^[a-f0-9]{64}$/.test(record.sha256))||(record.kind==='block'&&(typeof record.block!=='string'||!record.block.includes(start)||!record.block.includes(finish))))throw new Error('Invalid integration ownership record');
  }
  for(const dir of value.directories)if(!['.agents',base,'.cursor','.cursor/rules',privateDir].includes(dir))throw new Error('Invalid integration directory record');
  return value;
}
function intact(name,content,record) {
  if(content===null)return false;
  const [start,finish]=markers(name);
  return record.kind==='file'?sha(content)===record.sha256:content.split(record.block).length===2&&content.split(start).length===2&&content.split(finish).length===2;
}
function jsonText(value){return JSON.stringify(value,null,2)+'\n';}
function payload() {
  const instructions=fs.readFileSync(at('scripts/integration/instructions.md'),'utf8'),helper=fs.readFileSync(at('scripts/integration/submit.mjs'),'utf8');
  const link='At substantive planning, investigation, and implementation checkpoints, follow `.agents/brain-capture/instructions.md` for automatic private lesson capture. Read that file before capturing; retry pending submissions there. Do not collect transcripts or bypass project/user permissions.';
  return new Map([
    ['AGENTS.md',`${begin}\n${link}\n${end}`],
    ['CLAUDE.md',`${begin}\n${link}\n@.agents/brain-capture/instructions.md\n${end}`],
    ['.gitignore',`${markers('.gitignore')[0]}\n/.brain-capture/\n${markers('.gitignore')[1]}`],
    [`${base}/instructions.md`,instructions],[`${base}/submit.mjs`,helper],
    ['.cursor/rules/brain-capture.mdc',`---\ndescription: "Capture reusable lessons in Brain at substantive task checkpoints"\nalwaysApply: true\n---\n\n${link}\n`]
  ]);
}
const isBlock=name=>['AGENTS.md','CLAUDE.md','.gitignore'].includes(name);
function journalPath(root){return at(`.state/integration-transactions/${sha(root).slice(0,24)}.json`);}
function privateStorage(root,known) {
  noSymlinks(root,path.join(root,privateDir));
  if(fs.existsSync(path.join(root,privateDir))){
    const stat=fs.statSync(path.join(root,privateDir));
    if(!stat.isDirectory()||(stat.mode&0o077))throw new Error('Invalid private integration directory');
    if(!known)throw new Error('Refusing an unowned private capture directory');
  }
  const tracked=spawnSync('git',['ls-files','-z','--',privateDir],{cwd:root,timeout:5000,maxBuffer:65536});
  if(tracked.status!==0||tracked.stdout.length)throw new Error('Private integration storage is tracked or could not be checked');
}
export function integration(action,input,{yes=false,dryRun=false}={}) {
  if(!['status','install','remove','recover'].includes(action))throw new Error('Unknown integration operation');
  const root=project(input);
  if(action==='recover')return recover(root,{yes,dryRun});
  const previous=manifest(root);privateStorage(root,previous);
  const conflicts=Object.entries(previous?.records||{}).filter(([name,record])=>!intact(name,text(root,name),record)).map(([name])=>name);
  const interrupted=fs.existsSync(journalPath(root));
  if(action==='status')return {installed:previous?.installed||false,conflicts,recoveryNeeded:interrupted,privateQueuePreserved:!!previous};
  if(interrupted)throw new Error('Interrupted integration operation; run integration recover first');
  if(conflicts.length)throw new Error('Managed integration content changed or is missing; preserve it and inspect integration status');
  const records=structuredClone(previous?.records||{}),changes=[];
  function change(name,after){const before=text(root,name);if(before!==after)changes.push({path:name,before,after,mode:name.startsWith(privateDir+'/')?0o600:fs.existsSync(file(root,name))?fs.statSync(file(root,name)).mode&0o777:0o644});}
  if(action==='install'){
    noSymlinks(root,path.join(root,'AGENTS.override.md'));
    if(fs.existsSync(path.join(root,'AGENTS.override.md'))&&fs.statSync(path.join(root,'AGENTS.override.md')).size)throw new Error('AGENTS.override.md shadows the adapter; reconcile project instructions before enrollment');
    const desired=payload();assertClean([...desired].map(([id,value])=>({id,bytes:Buffer.from(value)})));
    desired.set(`${privateDir}/config.json`,jsonText({schemaVersion:1,cli:at('scripts/brain.mjs'),node:process.execPath,maxBytes:config().harvest.candidateBytes,domains:config().domains}));
    for(const [name,wanted]of desired){
      const current=text(root,name),owned=records[name];
      if(isBlock(name)){
        if(!owned&&current&&markers(name).some(marker=>current.includes(marker)))throw new Error('Unmanaged capture markers conflict with enrollment');
        const block=owned?owned.block:'\n\n'+wanted+'\n';
        const nextBlock=owned?'\n\n'+wanted+'\n':block;
        change(name,owned?current.replace(block,nextBlock):(current||'')+block);
        records[name]={kind:'block',block:nextBlock,created:owned?.created??current===null};
      }else{
        if(!owned&&current!==null)throw new Error('Refusing to replace an unmanaged integration file');
        change(name,wanted);records[name]={kind:'file',sha256:sha(wanted),created:owned?.created??current===null};
      }
    }
  }else{
    if(!previous?.installed)return {operation:action,noOp:true,changes:[],dryRun:dryRun||!yes};
    for(const [name,record]of Object.entries(records)){
      // Private configuration, queued lessons, receipts and their ignore rule survive removal.
      if(name==='.gitignore'||name.startsWith(privateDir+'/'))continue;
      const current=text(root,name),after=record.kind==='block'?current.replace(record.block,''):null;
      change(name,after===''&&record.created?null:after);delete records[name];
    }
  }
  const directories=new Set(previous?.directories||[]),createdDirectories=[];
  for(const dir of ['.agents',base,'.cursor','.cursor/rules',privateDir])if(!fs.existsSync(path.join(root,dir))){directories.add(dir);createdDirectories.push(dir);}
  const next={schemaVersion:1,manager:'brain-capture',installed:action==='install',records,directories:[...directories].sort()};
  change(manifestFile,jsonText(next));
  const result={operation:action,dryRun:dryRun||!yes,noOp:changes.length===0,changes:changes.map(c=>({path:c.path,action:c.after===null?'remove':c.before===null?'create':'update',beforeSha256:c.before===null?null:sha(c.before),afterSha256:c.after===null?null:sha(c.after),...(isBlock(c.path)?{managedBlock:records[c.path]?.block||previous?.records[c.path]?.block}:{} )})),privateQueuePreserved:action==='remove'};
  if(dryRun||!yes||!changes.length)return result;
  writeJSON(journalPath(root),{schemaVersion:1,root,changes,directories:createdDirectories},0o600);
  try{
    for(const c of changes){
      if(text(root,c.path)!==c.before)throw new Error('Integration file changed during installation');
      const target=file(root,c.path);
      if(c.path.startsWith(privateDir+'/'))fs.mkdirSync(path.join(root,privateDir),{recursive:true,mode:0o700});
      if(c.after===null)fs.unlinkSync(target);else atomic(target,c.after,c.mode);
    }
    fs.rmSync(journalPath(root));
  }catch{throw new Error('Integration interrupted; journal retained. Run integration recover before retrying');}
  return {...result,dryRun:false};
}
function recover(root,{yes,dryRun}) {
  const journal=readJSON(journalPath(root),null);if(!journal)return {recoveryNeeded:false};
  if(journal.schemaVersion!==1||journal.root!==root||!Array.isArray(journal.changes)||!Array.isArray(journal.directories))throw new Error('Invalid private integration journal');
  for(const c of journal.changes){
    file(root,c.path);
    if(![c.before,c.after].every(value=>value===null||typeof value==='string'&&Buffer.byteLength(value)<=1024*1024)||!Number.isInteger(c.mode)||c.mode<0||c.mode>0o777)throw new Error('Invalid integration recovery content');
    const actual=text(root,c.path);if(actual!==c.before&&actual!==c.after)throw new Error('Recovery would overwrite a later local edit; journal retained');
  }
  for(const dir of journal.directories)if(!['.agents',base,'.cursor','.cursor/rules',privateDir].includes(dir))throw new Error('Invalid recovery directory');
  if(journal.directories.includes(privateDir)&&['queue','receipts'].some(name=>fs.existsSync(path.join(root,privateDir,name))))throw new Error('New private capture evidence exists; preserve the ignore rule and reconcile recovery locally');
  const result={recoveryNeeded:true,files:journal.changes.length,dryRun:dryRun||!yes};if(dryRun||!yes)return result;
  for(const c of [...journal.changes].reverse()){
    const target=file(root,c.path);
    if(c.before===null)fs.rmSync(target,{force:true});else atomic(target,c.before,c.mode);
  }
  for(const dir of [...journal.directories].sort((a,b)=>b.length-a.length)){
    const target=path.join(root,dir);noSymlinks(root,target);
    if(fs.existsSync(target)&&fs.lstatSync(target).isDirectory()&&!fs.readdirSync(target).length)fs.rmdirSync(target);
  }
  fs.rmSync(journalPath(root));return {...result,dryRun:false,recovered:true};
}
