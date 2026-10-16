import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createGzip,createGunzip} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {spawnSync} from 'node:child_process';
import {at,ROOT,config,readJSON,writeJSON,sha,inside,safePath,noSymlinks,now} from './core.mjs';

const MAGIC=Buffer.from('BRAIN-PRIVATE-BACKUP-v1\n'),MAX_FILE=64*1024*1024,MAX_TOTAL=512*1024*1024,MAX_FILES=40000;
const omitted=new Set(['.git','node_modules','tools','lookup','backups','staging','wiki-plan-scope','recovery']);
function eligible(relative) {
  safePath(relative);
  if(relative!=='brain.config.local.json'&&!relative.startsWith('inbox/')&&!relative.startsWith('.state/'))return false;
  return !relative.split('/').some(part=>omitted.has(part)||/worktree|^(?:sessions|transcripts|rollouts)$/.test(part)||/^\.env(?:\.|$)|^(?:auth|credentials|tokens?)(?:[._-]|$)|^(?:raw_memories\.md|history\.jsonl|config\.toml|backup\.key|mutation\.lock)$|\.tmp$/.test(part));
}
function inventory() {
  const files=[];let bytes=0,visited=0;
  function visit(relative){
    if(++visited>MAX_FILES*2)throw new Error('Private backup discovery exceeds its bound');
    const file=at(relative);noSymlinks(ROOT,file);const stat=fs.lstatSync(file);
    if(stat.isSymbolicLink())throw new Error('Private backup refuses symlinks');
    if(stat.isDirectory()){
      if(relative!=='.state'&&relative!=='inbox'&&!eligible(relative+'/entry'))return;
      for(const item of fs.readdirSync(file))visit(relative+'/'+item);
    }else if(stat.isFile()&&eligible(relative)){
      if(stat.size>MAX_FILE||(bytes+=stat.size)>MAX_TOTAL||files.length>=MAX_FILES)throw new Error('Private backup exceeds its file/byte bound');
      files.push({path:relative,bytes:stat.size});
    }
  }
  for(const relative of ['brain.config.local.json','inbox','.state'])if(fs.existsSync(at(relative)))visit(relative);
  return {files:files.sort((a,b)=>a.path.localeCompare(b.path)),bytes};
}
function keyBytes(file,{create=false}={}) {
  const target=path.resolve(file||at('.state/backup.key'));
  if(target===at('.state/backup.key'))noSymlinks(ROOT,target);
  if(!fs.existsSync(target)&&create&&target===at('.state/backup.key'))fs.writeFileSync(target,crypto.randomBytes(32),{mode:0o600,flag:'wx'});
  const stat=fs.lstatSync(target);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size!==32||stat.mode&0o077)throw new Error('Recovery key must be a private regular 32-byte file');
  return fs.readFileSync(target);
}
function outputDirectory(input) {
  const directory=path.resolve(input||readJSON(at('.state/backup-settings.json'),{}).directory||at('.state/backups'));
  if(inside(ROOT,directory)&&!inside(at('.state/backups'),directory))throw new Error('Local archives belong only under .state/backups');
  if(inside(ROOT,directory))noSymlinks(ROOT,directory);
  fs.mkdirSync(directory,{recursive:true,mode:0o700});
  if(fs.lstatSync(directory).isSymbolicLink())throw new Error('Backup directory cannot be a symlink');
  return fs.realpathSync(directory);
}
const metadata=record=>JSON.stringify({path:record.path,bytes:record.bytes,sha256:record.sha256})+'\n';

export function backupSummary() {
  const state=readJSON(at('.state/backup-runs.json'),{}),cloud=readJSON(at('.state/backup-cloud.json'),{}),latest=[...(state.archives||[])].sort((a,b)=>b.verifiedAt.localeCompare(a.verifiedAt))[0];
  return {lastAttempt:state.lastAttempt||null,lastSuccess:state.lastSuccess||null,lastFailure:state.lastFailure||null,verifiedArchives:(state.archives||[]).length,keyPresent:fs.existsSync(at('.state/backup.key')),localOnly:!latest?.cloud,cloudConfigured:cloud.provider==='google-drive',cloudVerifiedAt:latest?.cloud?.observedAt||null,cloudVerification:latest?.cloud?.method||null,recoveryKeyIncluded:false};
}

export function configureCloudBackup(folderId,folderUrl) {
  if(!/^[\w-]{10,}$/.test(folderId||'')||folderUrl!==`https://drive.google.com/drive/folders/${folderId}`)throw new Error('Use the verified Google Drive folder ID and URL');
  writeJSON(at('.state/backup-cloud.json'),{provider:'google-drive',folderId,folderUrl},0o600);return {provider:'google-drive',folderId,folderUrl,recoveryKeyUploaded:false};
}

export async function pendingCloudBackups({limit=1}={}) {
  limit=Number(limit);if(!Number.isInteger(limit)||limit<1||limit>7)throw new Error('Pending backup limit must be between 1 and 7');
  const cloud=readJSON(at('.state/backup-cloud.json'),{});if(cloud.provider!=='google-drive')return {configured:false,archives:[]};
  const state=readJSON(at('.state/backup-runs.json'),{archives:[]}),pending=[];
  for(const record of [...state.archives].sort((a,b)=>b.verifiedAt.localeCompare(a.verifiedAt))){
    if(record.cloud||!fs.existsSync(record.file))continue;
    const inspected=await inspectBackup(record.file);if(inspected.archiveSha256!==record.sha256)throw new Error('Pending backup changed; refusing upload');
    pending.push({file:record.file,name:path.basename(record.file),size:fs.statSync(record.file).size,sha256:record.sha256});if(pending.length===limit)break;
  }
  return {configured:true,provider:cloud.provider,folderId:cloud.folderId,folderUrl:cloud.folderUrl,archives:pending,notice:'Upload only these encrypted archives, never backup.key. Confirm provider metadata before recording cloud availability. No cloud files are deleted by the CLI.'};
}

export async function recordCloudBackup(file,receiptFile) {
  if(!file||!receiptFile)throw new Error('--file and --receipt are required');
  const cloud=readJSON(at('.state/backup-cloud.json'),{}),state=readJSON(at('.state/backup-runs.json'),{archives:[]}),record=state.archives.find(item=>item.file===path.resolve(file)),receipt=readJSON(path.resolve(receiptFile));
  if(!record||cloud.provider!=='google-drive'||receipt.parentId!==cloud.folderId||receipt.name!==path.basename(file)||Number(receipt.size)!==fs.statSync(file).size||!/^[\w-]{10,}$/.test(receipt.id||'')||!/^https:\/\/drive\.google\.com\//.test(receipt.url||'')||!Number.isFinite(Date.parse(receipt.observedAt)))throw new Error('Cloud readback does not identify this configured backup');
  const inspected=await inspectBackup(record.file);if(inspected.archiveSha256!==record.sha256)throw new Error('Local encrypted archive changed');
  record.cloud={provider:'google-drive',id:receipt.id,url:receipt.url,observedAt:receipt.observedAt,method:'connector-upload-and-metadata-readback',size:Number(receipt.size)};
  writeJSON(at('.state/backup-runs.json'),state,0o600);return {ok:true,cloud:record.cloud,notice:'Cloud presence follows connector upload and metadata readback. Local archive authentication/checksums were verified; this is not a downloaded-cloud-byte verification.'};
}

export async function inspectBackup(file,{keyFile,restoreTo,yes=false}={}) {
  if(!file)throw new Error('--file is required');const archive=path.resolve(file);if(inside(ROOT,archive))noSymlinks(ROOT,archive);const stat=fs.lstatSync(archive);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size<MAGIC.length+12+16||stat.size>MAX_TOTAL*1.6)throw new Error('Invalid bounded backup archive');
  const fd=fs.openSync(archive,'r'),header=Buffer.alloc(MAGIC.length+12),tag=Buffer.alloc(16);
  try{fs.readSync(fd,header,0,header.length,0);fs.readSync(fd,tag,0,16,stat.size-16);}finally{fs.closeSync(fd);}
  if(!header.subarray(0,MAGIC.length).equals(MAGIC))throw new Error('Unknown private backup format');
  const key=keyBytes(keyFile),decipher=crypto.createDecipheriv('aes-256-gcm',key,header.subarray(MAGIC.length),{authTagLength:16});key.fill(0);
  decipher.setAAD(header);decipher.setAuthTag(tag);
  const digest=crypto.createHash('sha256').update(header),manifest=crypto.createHash('sha256'),seen=new Set();
  let stage=null,target=null,files=0,bytes=0,headerSeen=false,footerSeen=false,createdAt=null,expanded=0;
  if(restoreTo){
    target=path.resolve(restoreTo);if(inside(ROOT,target))noSymlinks(ROOT,target);
    if(inside(ROOT,target)&&!inside(at('.state/recovery'),target))throw new Error('Restore inside Brain only under .state/recovery');
    if(fs.existsSync(target)&&(fs.lstatSync(target).isSymbolicLink()||!fs.statSync(target).isDirectory()||fs.readdirSync(target).length))throw new Error('Restore requires a missing or empty destination');
    if(yes){fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});stage=fs.mkdtempSync(path.join(path.dirname(target),'.brain-restore-'));fs.chmodSync(stage,0o700);}
  }
  function consume(line){
    const record=JSON.parse(line);
    if(record.type==='header'&&!headerSeen&&!files&&!footerSeen){if(record.schemaVersion!==1)throw new Error('Unknown backup payload');headerSeen=true;createdAt=record.createdAt;return;}
    if(!headerSeen||footerSeen)throw new Error('Invalid backup record order');
    if(record.type==='footer'){
      if(record.files!==files||record.bytes!==bytes||record.manifestSha256!==manifest.digest('hex'))throw new Error('Backup manifest does not match');footerSeen=true;return;
    }
    if(record.type!=='file'||!eligible(record.path)||seen.has(record.path)||!Number.isInteger(record.bytes)||record.bytes<0||record.bytes>MAX_FILE||typeof record.data!=='string'||record.data.length!==Math.ceil(record.bytes/3)*4||!/^[A-Za-z0-9+/]*={0,2}$/.test(record.data))throw new Error('Invalid private backup file record');
    const data=Buffer.from(record.data,'base64');
    if(data.length!==record.bytes||sha(data)!==record.sha256||++files>MAX_FILES||(bytes+=data.length)>MAX_TOTAL)throw new Error('Private backup checksum or bound failed');
    seen.add(record.path);manifest.update(metadata(record));
    if(stage){const destination=path.join(stage,record.path);noSymlinks(stage,destination);fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o700});fs.writeFileSync(destination,data,{mode:0o600,flag:'wx'});}
  }
  try{
    const gunzip=createGunzip();gunzip.setEncoding('utf8');
    await pipeline(fs.createReadStream(archive,{start:header.length,end:stat.size-17}),new Transform({transform(chunk,encoding,done){digest.update(chunk);done(null,chunk);}}),decipher,gunzip,async source=>{
      let pending='';for await(const chunk of source){expanded+=Buffer.byteLength(chunk);if(expanded>MAX_TOTAL*1.5+MAX_FILES*2048)throw new Error('Expanded backup exceeds its bound');pending+=chunk;
        let end;while((end=pending.indexOf('\n'))!==-1){const line=pending.slice(0,end);pending=pending.slice(end+1);if(line.length>Math.ceil(MAX_FILE*4/3)+4096)throw new Error('Backup record exceeds its bound');consume(line);}
        if(pending.length>Math.ceil(MAX_FILE*4/3)+4096)throw new Error('Backup record exceeds its bound');
      }if(pending)throw new Error('Truncated backup record');
    });
    if(!headerSeen||!footerSeen)throw new Error('Incomplete private backup');
    // Authentication and every content checksum must succeed before activating
    // any restored bytes. Existing state is never overwritten.
    if(stage){if(fs.existsSync(target)&&fs.readdirSync(target).length)throw new Error('Restore destination changed');fs.renameSync(stage,target);stage=null;fs.chmodSync(target,0o700);}
    return {ok:true,createdAt,files,bytes,archiveSha256:digest.update(tag).digest('hex'),restored:!!(restoreTo&&yes),restorePlanned:!!(restoreTo&&!yes),notice:'The recovery key is separate from this archive. Restore never activates code or overwrites existing state.'};
  }catch(error){throw new Error('Backup authentication, checksum, or recovery failed; archive retained', {cause:error});}
  finally{if(stage)fs.rmSync(stage,{recursive:true,force:true});}
}

export async function createBackup({directory,keyFile,dryRun=false,dueOnly=false}={}) {
  const state=readJSON(at('.state/backup-runs.json'),{archives:[]});
  if(dueOnly&&state.lastSuccess&&Date.now()-Date.parse(state.lastSuccess)<(config().maintenance?.backupHours??24)*3600000)return {skipped:true,reason:'Verified backup is current'};
  if(dryRun){const plan=inventory();return {dryRun:true,files:plan.files.length,bytes:plan.bytes,...backupSummary()};}
  const folder=outputDirectory(directory);writeJSON(at('.state/backup-settings.json'),{directory:folder},0o600);
  const key=keyBytes(keyFile,{create:true}),iv=crypto.randomBytes(12),header=Buffer.concat([MAGIC,iv]);
  const cipher=crypto.createCipheriv('aes-256-gcm',key,iv,{authTagLength:16});key.fill(0);cipher.setAAD(header);
  const name=`brain-${now().replace(/[-:.]/g,'')}-${crypto.randomBytes(6).toString('hex')}.brainbackup`,destination=path.join(folder,name),temporary=destination+'.tmp';
  state.lastAttempt=now();writeJSON(at('.state/backup-runs.json'),state,0o600);
  try{
    const plan=inventory();
    fs.writeFileSync(temporary,header,{mode:0o600,flag:'wx'});
    async function* records(){
      const head=spawnSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8',timeout:10000});
      yield JSON.stringify({type:'header',schemaVersion:1,createdAt:now(),gitHead:head.status===0?head.stdout.trim():null})+'\n';
      const manifest=crypto.createHash('sha256');let bytes=0;
      for(const file of plan.files){noSymlinks(ROOT,at(file.path));const data=fs.readFileSync(at(file.path));if(data.length!==file.bytes||data.length>MAX_FILE)throw new Error('Private state changed during backup');const record={type:'file',...file,sha256:sha(data),data:data.toString('base64')};bytes+=data.length;manifest.update(metadata(record));yield JSON.stringify(record)+'\n';}
      yield JSON.stringify({type:'footer',files:plan.files.length,bytes,manifestSha256:manifest.digest('hex')})+'\n';
    }
    await pipeline(records(),createGzip(),cipher,fs.createWriteStream(temporary,{flags:'a',mode:0o600}));
    fs.appendFileSync(temporary,cipher.getAuthTag());const fd=fs.openSync(temporary,'r+');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    const verified=await inspectBackup(temporary,{keyFile});fs.renameSync(temporary,destination);
    state.lastSuccess=now();state.lastFailure=null;state.archives.push({file:destination,verifiedAt:state.lastSuccess,sha256:verified.archiveSha256,files:verified.files,bytes:verified.bytes});
    writeJSON(at('.state/backup-runs.json'),state,0o600);
    return {ok:true,archive:destination,files:verified.files,bytes:verified.bytes,encrypted:true,verified:true,localOnly:inside(ROOT,folder),keyFile:keyFile||at('.state/backup.key'),recoveryKeyIncluded:false,notice:'Keep a separate private copy of the recovery key and an off-device archive. Git does not contain these private backups.'};
  }catch(error){state.lastFailure={at:now(),reason:'Encrypted backup failed; previous verified archives retained'};writeJSON(at('.state/backup-runs.json'),state,0o600);throw error;}
  finally{if(fs.existsSync(temporary))fs.rmSync(temporary);}
}

export async function pruneBackups() {
  const state=readJSON(at('.state/backup-runs.json'),{archives:[]}),settings=readJSON(at('.state/backup-settings.json'),{}),keep=Number(config().maintenance?.keepBackups??7),removed=[];
  if(!Number.isInteger(keep)||keep<2||keep>365)throw new Error('Backup retention must keep between 2 and 365 verified local archives');
  const records=[...(state.archives||[])].sort((a,b)=>b.verifiedAt.localeCompare(a.verifiedAt));
  for(const record of records.slice(keep)){
    if(inside(ROOT,record.file))try{noSymlinks(ROOT,record.file);}catch{continue;}
    if(!/^brain-[\dTZ]+-[a-f0-9]{12}\.brainbackup$/.test(path.basename(record.file))||!fs.existsSync(record.file)||!fs.lstatSync(record.file).isFile()||fs.lstatSync(record.file).isSymbolicLink()||path.dirname(record.file)!==path.resolve(settings.directory||at('.state/backups')))continue;
    const digest=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(record.file))digest.update(chunk);
    if(digest.digest('hex')!==record.sha256)continue;
    fs.rmSync(record.file);removed.push(record.file);
  }
  state.archives=records.filter(record=>!removed.includes(record.file));writeJSON(at('.state/backup-runs.json'),state,0o600);return {removed:removed.length,retained:state.archives.length};
}
