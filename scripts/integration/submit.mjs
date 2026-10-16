#!/usr/bin/env node
// Standalone project helper: only built-in modules, no project code execution.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function checked(relative) {
  let file=root;
  for(const part of relative.split('/')){
    if(!part||part==='.'||part==='..')throw new Error('Unsafe capture path');
    file=path.join(file,part);
    try{if(fs.lstatSync(file).isSymbolicLink())throw new Error('Capture paths must not contain symlinks');}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return file;
}
function read(relative,limit) {
  const file=checked(relative),stat=fs.statSync(file);
  if(!stat.isFile()||stat.size>limit)throw new Error('Invalid or oversized capture record');
  if(relative.startsWith('.brain-capture/')&&(stat.mode&0o077))throw new Error('Capture record permissions are too broad');
  try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw new Error('Invalid capture record; body suppressed');}
}
function write(relative,value) {
  const file=checked(relative),dir=path.dirname(file);
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  if(fs.statSync(dir).mode&0o077)throw new Error('Capture storage permissions are too broad');
  const temporary=file+'.'+crypto.randomUUID()+'.tmp';
  try{fs.writeFileSync(temporary,JSON.stringify(value)+'\n',{mode:0o600,flag:'wx'});fs.renameSync(temporary,file);}finally{fs.rmSync(temporary,{force:true});}
}
function receiptPath(id){return `.brain-capture/receipts/${id}.json`;}
function queuePath(id){return `.brain-capture/queue/${id}.json`;}
function validate(record,cfg,id) {
  if(record.schemaVersion!==1||!cfg.domains.includes(record.domain)||typeof record.text!=='string'||!record.text.trim()||Buffer.byteLength(record.text)>cfg.maxBytes||hash(record.domain+'\0'+record.text)!==id)throw new Error('Capture queue integrity check failed');
}
function deliver(id,cfg) {
  const file=queuePath(id);
  try{
    const record=read(file,cfg.maxBytes*6+4096);validate(record,cfg,id);
    if(fs.existsSync(checked(receiptPath(id)))){
      const receipt=read(receiptPath(id),4096);
      if(receipt.submission!==id||!['saved','quarantined'].includes(receipt.state)||!/^[a-f0-9]{24}$/.test(receipt.candidate))throw new Error('Invalid capture receipt');
      fs.unlinkSync(checked(file));return {submission:id,state:receipt.state,candidate:receipt.candidate,duplicate:true};
    }
    const result=spawnSync(cfg.node,[cfg.cli,'capture','--stdin','--domain',record.domain],{input:record.text,encoding:'utf8',timeout:15000,maxBuffer:65536,cwd:path.dirname(path.dirname(cfg.cli)),shell:false});
    if(result.error||result.status!==0)return {submission:id,state:'queued',reason:'Brain unavailable or capture failed; exact bytes retained for retry'};
    let response;try{response=JSON.parse(result.stdout);}catch{return {submission:id,state:'queued',reason:'Unconfirmed Brain response; exact bytes retained for retry'};}
    if(!/^[a-f0-9]{24}$/.test(response.id)||!['pending','quarantined'].includes(response.status))return {submission:id,state:'queued',reason:'Unconfirmed Brain receipt; exact bytes retained for retry'};
    const receipt={submission:id,state:response.status==='pending'?'saved':'quarantined',candidate:response.id,recordedAt:new Date().toISOString()};
    write(receiptPath(id),receipt);fs.unlinkSync(checked(file));return receipt;
  }catch{return {submission:id,state:'retained',reason:'Capture record or storage failed validation; content retained, body suppressed'};}
}
async function main() {
  const cfg=read('.brain-capture/config.json',16384);
  if(cfg.schemaVersion!==1||!path.isAbsolute(cfg.cli)||!path.isAbsolute(cfg.node)||!Number.isInteger(cfg.maxBytes)||cfg.maxBytes<1||cfg.maxBytes>16384||!Array.isArray(cfg.domains)||!cfg.domains.every(d=>typeof d==='string'))throw new Error('Invalid project capture configuration');
  // Check each path: check-ignore succeeds if ANY supplied path is ignored.
  for(const name of ['config.json','queue/probe.json','receipts/probe.json'])if(spawnSync('git',['check-ignore','--no-index','-q','--',`.brain-capture/${name}`],{cwd:root,timeout:5000}).status!==0)throw new Error('Private capture storage must be ignored by Git');
  if(fs.statSync(checked('.brain-capture')).mode&0o077)throw new Error('Capture directory permissions are too broad');
  const tracked=spawnSync('git',['ls-files','-z','--','.brain-capture'],{cwd:root,timeout:5000,maxBuffer:65536});
  if(tracked.status!==0||tracked.stdout.length)throw new Error('Private capture storage must not be tracked');
  const lock=checked('.brain-capture/queue.lock');
  try{fs.writeFileSync(lock,JSON.stringify({pid:process.pid}),{flag:'wx',mode:0o600});}catch(error){
    if(error.code!=='EEXIST')throw error;
    const owner=read('.brain-capture/queue.lock',1024);
    if(!Number.isInteger(owner.pid)||owner.pid<1)throw new Error('Invalid capture lock; preserve it for inspection');
    try{process.kill(owner.pid,0);throw new Error('Another capture helper is running');}catch(e){if(e.code!=='ESRCH')throw e;}
    fs.unlinkSync(lock);fs.writeFileSync(lock,JSON.stringify({pid:process.pid}),{flag:'wx',mode:0o600});
  }
  try{
    const [command,...options]=process.argv.slice(2);
    if(command==='submit'){
      if(options.length!==2||options[0]!=='--domain'||!cfg.domains.includes(options[1]))throw new Error('Use submit --domain <configured-domain> with lesson text on stdin');
      const chunks=[];let size=0;for await(const chunk of process.stdin){size+=chunk.length;if(size>cfg.maxBytes)throw new Error('Lesson exceeds the candidate byte limit');chunks.push(chunk);}
      const text=Buffer.concat(chunks).toString('utf8').trim();if(!text)throw new Error('Lesson text is required');
      const domain=options[1],id=hash(domain+'\0'+text),file=queuePath(id);
      if(fs.existsSync(checked(file))){const existing=read(file,cfg.maxBytes*6+4096);validate(existing,cfg,id);}
      else write(file,{schemaVersion:1,domain,text,privacy:'agent-sanitized; not yet verified by Brain'});
      return {results:[deliver(id,cfg)]};
    }
    if(command==='flush'&&!options.length){
      const dir=checked('.brain-capture/queue');if(!fs.existsSync(dir))return {results:[]};
      if(!fs.statSync(dir).isDirectory()||(fs.statSync(dir).mode&0o077))throw new Error('Invalid capture queue directory');
      const files=[];let visited=0;
      for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(++visited>1000)throw new Error('Queue exceeds inspection bound; preserve it for inspection');if(/^[a-f0-9]{64}\.json$/.test(entry.name))files.push(entry.name.slice(0,-5));}
      const results=[];for(const id of files.sort().slice(0,3)){const result=deliver(id,cfg);results.push(result);if(result.state==='queued')break;}
      return {results};
    }
    throw new Error('Use submit --domain <domain> or flush');
  }finally{fs.unlinkSync(lock);}
}
try{const result=await main();console.log(JSON.stringify(result,null,2));if(result.results.some(r=>r.state==='queued'||r.state==='retained'))process.exitCode=1;}
catch{console.error('brain-capture: operation failed; content and private configuration suppressed. Check installation status, permissions, or queued records locally.');process.exitCode=1;}
