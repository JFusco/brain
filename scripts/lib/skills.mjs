import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {at,ROOT,config,readJSON,json,writeJSON,atomic,mkdir,sha,safePath,noSymlinks,walk,inside,now} from './core.mjs';
import {lock,registry,snapshotFiles} from './official.mjs';
import {assertClean} from './privacy.mjs';
import {projectContext,projectDirectory} from './project-context.mjs';

function project(input,{workspace}={}) {
  if(!input)throw new Error('--project <path> is required');
  const context=projectContext(input,{workspace}),root=context.selectedRoot;
  if(context.workspaceSelectionRequired)throw new Error('Select an application with --workspace or supply its directory as --project; workspace dependencies are never merged');
  if(root===ROOT||inside(ROOT,root))throw new Error('Do not install skills inside the brain');
  if(!fs.existsSync(path.join(root,'package.json')))throw new Error('Project must contain package.json');
  noSymlinks(root,path.join(root,'.agents'));noSymlinks(root,path.join(root,'.claude'));
  const manifests=[{directory:root,manifest:json(path.join(root,'package.json'))}];
  const dependencies=context.dependencies;
  const manifestPath=path.join(root,'.agents/skills/brain.source.json');noSymlinks(root,manifestPath);
  const managed=readJSON(manifestPath,{schemaVersion:1,manager:'brain',skills:{},files:{},links:{}});
  if(managed.manager!=='brain'||managed.schemaVersion!==1)throw new Error('Existing skills manifest is not brain-managed');
  for(const [key,record]of Object.entries(managed.files)){safePath(key);managedPath(key);if(!/^[0-9a-f]{64}$/.test(record.sha256||''))throw new Error('Invalid managed file hash');}
  for(const [key,record]of Object.entries(managed.links)){safePath(key);const valid=/^\.claude\/skills\/[a-z0-9][a-z0-9._-]*$/.test(key)||/^\.claude\/docs\/.+/.test(key),target=path.posix.relative(path.posix.dirname(key),key.replace(/^\.claude\//,'.agents/'));if(!valid||record.target!==target)throw new Error('Invalid managed compatibility link');}
  for(const skill of Object.values(managed.skills))if(!/^[a-z0-9][a-z0-9._-]*$/.test(skill.name)||skill.target!==`.agents/skills/${skill.name}`)throw new Error('Invalid managed skill destination');
  return {root,dependencies,manifests,managed,manifestPath};
}
function managedPath(name) {
  safePath(name);
  if(name!=='.agents/skills/brain.source.json'&&!/^\.(?:agents|claude)\/(?:skills|docs)\/.+/.test(name))throw new Error('Manifest path is outside project skill management');
}
function installedStatus(p,skill,entry) {
  const installed=p.managed.skills[skill.id];
  if(installed){for(const name of installed.files){const record=p.managed.files[name];const file=path.join(p.root,name);noSymlinks(p.root,file);if(!record||!fs.existsSync(file)||sha(fs.readFileSync(file))!==record.sha256)return 'modified locally';}
    for(const name of installed.links||[]){const record=p.managed.links[name];try{if(!record||!fs.lstatSync(path.join(p.root,name)).isSymbolicLink()||fs.readlinkSync(path.join(p.root,name))!==record.target)return 'modified locally';}catch{return 'modified locally';}}
    return installed.revision===entry.revision?'installed':'outdated';}
  const target=path.join(p.root,'.agents/skills',skill.name);if(fs.existsSync(target))return 'unmanaged conflict';
  const sameName=Object.values(p.managed.skills).some(s=>s.name===skill.name||s.declaredName===skill.declaredName);return sameName?'provider conflict':'not installed';
}
function compatibility(p,skill) {
  if(!skill.installable)return {matches:false,reason:skill.blockedReason||'Source is reference-only'};
  const rules=skill.appliesTo||{},matches=Object.keys(p.dependencies).filter(name=>(rules.dependencies||[]).some(pattern=>pattern.endsWith('/*')?name.startsWith(pattern.slice(0,-1)):name===pattern));
  if(!matches.length)return {matches:false,reason:'No matching declared dependency'};
  if(matches.some(name=>!p.dependencies[name].version&&!/^[~^]?\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?$/.test(p.dependencies[name].declared)))return {matches:false,reason:'Dependency version cannot be determined safely'};
  if(skill.policy==='sitecore-bundle'){
    const version=p.dependencies['@sitecore-content-sdk/nextjs']?.version||p.dependencies['@sitecore-content-sdk/nextjs']?.declared;
    if(!/^[~^]?2\./.test(version||''))return {matches:false,reason:'Sitecore Content SDK 2.x is required by this guidance'};
    const next=p.dependencies.next?.version||p.dependencies.next?.declared;
    if(!/^[~^]?16\./.test(next||''))return {matches:false,reason:'This Sitecore bundle requires Next.js 16.x'};
    const nextConfig=['next.config.ts','next.config.mjs','next.config.js'].map(name=>path.join(p.root,name)).find(file=>fs.existsSync(file));
    if(!nextConfig||fs.statSync(nextConfig).size>65536||! /\bcacheComponents\s*:\s*true\b/.test(fs.readFileSync(nextConfig,'utf8')))return {matches:false,reason:'The required Cache Components configuration is not confirmed'};
    if(!['src/app','app'].some(name=>fs.existsSync(path.join(p.root,name))))return {matches:false,reason:'The App Router project layout is absent'};
  }
  if(skill.name==='nextjs' && (p.dependencies.next?.version||p.dependencies.next?.declared)?.match(/^[~^]?(\d+)/)?.[1]>=16)return {matches:false,reason:'Prefer installed Next.js bundled documentation; historical skill is not recommended'};
  for(const required of rules.requiredScripts||[])if(!p.manifests.some(m=>m.manifest.scripts?.[required]))return {matches:false,reason:`Required project script is absent: ${required}`};
  for(const required of rules.requiredPaths||[]){safePath(required);if(!fs.existsSync(path.join(p.root,required)))return {matches:false,reason:`Required project layout is absent: ${required}`};}
  return {matches:true,reason:matches.map(name=>`${name} ${p.dependencies[name].version||p.dependencies[name].declared} (${p.dependencies[name].confidence})`).join(', ')};
}
export function suggest(input,{workspace}={}) {
  const p=project(input,{workspace}),active=lock(),all=[];
  for(const entry of Object.values(active.sources))for(const skill of entry.skills) {
    const relevant=Object.keys(p.dependencies).some(name=>(skill.appliesTo?.dependencies||[]).some(pattern=>pattern.endsWith('/*')?name.startsWith(pattern.slice(0,-1)):name===pattern));
    if(!p.managed.skills[skill.id]&&(!relevant||skill.policy==='curated'&&!skill.installable))continue;
    const match=compatibility(p,skill),status=installedStatus(p,skill,entry);
    all.push({id:skill.id,name:skill.name,declaredName:skill.declaredName,source:entry.id,revision:entry.revision,status:status==='not installed'&&match.matches?'recommended':status,compatible:match.matches,reason:match.reason,preferred:skill.preferred});
  }
  for(const item of all)if(item.compatible&&!item.preferred&&all.some(other=>other.preferred&&other.compatible&&(other.name===item.name||other.declaredName===item.declaredName))){item.compatible=false;item.reason='A preferred provider supplies this skill';if(item.status==='recommended')item.status='alternative provider';}
  for(const [id,installed]of Object.entries(p.managed.skills))if(!all.some(s=>s.id===id))all.push({id,name:installed.name,status:'removed upstream',compatible:false,reason:'Retained locally; removal requires an explicit command'});
  return all.sort((a,b)=>a.id.localeCompare(b.id));
}
function desiredFiles(skill,entry) {
  const files=snapshotFiles(entry),out=new Map();
  for(const [name,bytes]of files) {
    if(name.startsWith(skill.directory+'/'))out.set(`.agents/skills/${skill.name}/`+name.slice(skill.directory.length+1),bytes);
    else if(skill.policy==='sitecore-bundle'&&name.startsWith('docs/'))out.set('.agents/'+name,bytes);
    else if(/^(?:LICENSE(?:\.[^/]*)?)$/i.test(name))out.set(`.agents/skills/${skill.name}/${name}`,bytes);
  }
  // Keep explicit attribution even when upstream declares a license in metadata only.
  out.set(`.agents/skills/${skill.name}/brain.attribution.json`,Buffer.from(JSON.stringify({source:entry.id,repository:entry.repository,revision:entry.revision,license:entry.license,skill:skill.id},null,2)+'\n'));
  return out;
}
export function mutate(action,input,ids,{recommended=false,yes=false,dryRun=false,copy=null,workspace}={}) {
  const p=project(input,{workspace}),active=lock(),suggestions=suggest(input,{workspace});
  if(recommended){if(ids.length)throw new Error('Choose IDs or --recommended');ids=suggestions.filter(s=>s.compatible&&(action==='update'?['outdated']:['recommended']).includes(s.status)).map(s=>s.id);}
  if(!ids.length){if(recommended)return {operations:[],noOp:true,dryRun:dryRun||!yes};throw new Error('No matching skills selected');}
  if(new Set(ids).size!==ids.length)throw new Error('Duplicate skill IDs');
  if(!['install','update','remove'].includes(action))throw new Error('Unknown skills operation');
  const writes=new Map(),deletes=new Set(),links=new Map(),next=structuredClone(p.managed),operations=[];
  for(const id of ids) {
    const entry=Object.values(active.sources).find(e=>e.skills.some(s=>s.id===id)),skill=entry?.skills.find(s=>s.id===id),previous=p.managed.skills[id];
    if(action==='remove'){
      if(!previous)throw new Error('Removal only supports brain-managed skills');
      delete next.skills[id];operations.push({id,action});continue;
    }
    if(!entry||!skill)throw new Error('Unknown active skill ID');
    const suggestion=suggestions.find(s=>s.id===id);
    if(!suggestion.compatible)throw new Error(`Skill is not compatible: ${id}: ${suggestion.reason}`);
    if(action==='update'&&!previous)throw new Error('Update only supports previously managed skills');
    if(['modified locally','unmanaged conflict','provider conflict'].includes(suggestion.status))throw new Error(`Skill conflict: ${id} (${suggestion.status})`);
    if(Object.values(next.skills).some(s=>s.id!==id&&(s.name===skill.name||s.declaredName===skill.declaredName)))throw new Error('Requested providers have colliding skill names');
    const desired=desiredFiles(skill,entry),owned=[];
    for(const [name,bytes]of desired){safePath(name);writes.set(name,bytes);owned.push(name);next.files[name]={sha256:sha(bytes)};}
    const alias=`.claude/skills/${skill.name}`,useCopy=copy??previous?.copy??false,ownedLinks=[];
    if(useCopy){for(const [name,bytes]of desired)if(name.startsWith(`.agents/skills/${skill.name}/`)||name.startsWith('.agents/docs/')){const name2=name.startsWith('.agents/docs/')?name.replace(/^\.agents\//,'.claude/'):`${alias}/`+name.slice(`.agents/skills/${skill.name}/`.length);writes.set(name2,bytes);owned.push(name2);next.files[name2]={sha256:sha(bytes)};}}
    else{links.set(alias,{target:path.relative(path.dirname(path.join(p.root,alias)),path.join(p.root,'.agents/skills',skill.name)),skill:id});ownedLinks.push(alias);for(const name of desired.keys())if(name.startsWith('.agents/docs/')){const aliasDoc=name.replace(/^\.agents\//,'.claude/');links.set(aliasDoc,{target:path.posix.relative(path.posix.dirname(aliasDoc),name),skill:id});ownedLinks.push(aliasDoc);}}
    next.skills[id]={id,name:skill.name,declaredName:skill.declaredName,source:entry.id,repository:entry.repository,revision:entry.revision,license:entry.license,target:`.agents/skills/${skill.name}`,files:owned,links:ownedLinks,copy:useCopy};operations.push({id,action});
  }
  // Recompute ownership after updates/removals; shared docs survive remaining owners.
  const keep=new Set(Object.values(next.skills).flatMap(s=>s.files)),keepLinks=new Set(Object.values(next.skills).flatMap(s=>s.links||[]));
  for(const name of Object.keys(p.managed.files))if(!keep.has(name)){deletes.add(name);delete next.files[name];}
  for(const name of Object.keys(p.managed.links))if(!keepLinks.has(name))delete next.links[name];
  for(const [name,record]of links)next.links[name]=record;
  for(const [name,bytes]of writes)if(Object.entries(next.skills).some(([id,s])=>!ids.includes(id)&&s.files.includes(name))&&p.managed.files[name]?.sha256!==sha(bytes))throw new Error('A supporting file is shared with a skill outside this update');
  const touched=new Set([...writes.keys(),...deletes]);
  for(const name of touched) {
    safePath(name);const file=path.join(p.root,name);noSymlinks(p.root,file);
    const before=p.managed.files[name];
    if(fs.existsSync(file)){
      if(!before)throw new Error('Refusing to overwrite an unmanaged supporting file');
      if(!fs.lstatSync(file).isFile()||sha(fs.readFileSync(file))!==before.sha256)throw new Error('A managed file was modified locally');
    }else if(before)throw new Error('A managed file is missing');
  }
  for(const name of new Set([...Object.keys(p.managed.links),...links.keys()])) {
    const file=path.join(p.root,name);noSymlinks(p.root,path.dirname(file));let stat;try{stat=fs.lstatSync(file);}catch(e){if(e.code!=='ENOENT')throw e;}
    const previous=p.managed.links[name];
    if(stat&&(!previous||!stat.isSymbolicLink()||fs.readlinkSync(file)!==previous.target))throw new Error('Refusing to replace an unmanaged or modified compatibility path');
    if(previous&&!stat)throw new Error('Managed compatibility link is missing');
  }
  // Refuse extra local files in folders being removed or replaced.
  for(const id of ids){const previous=p.managed.skills[id];if(previous)for(const file of walk(path.join(p.root,previous.target))){const rel=path.relative(p.root,file).split(path.sep).join('/');if(!p.managed.files[rel])throw new Error('Managed skill folder contains an unmanaged file');}}
  assertClean([...writes].map(([id,bytes])=>({id,bytes})),{clients:false});
  const created=new Set(p.managed.createdDirectories||[]);
  for(const name of [...writes.keys(),...links.keys(),'.agents/skills/brain.source.json']){let dir=path.posix.dirname(name);while(dir!=='.'){if(!fs.existsSync(path.join(p.root,dir)))created.add(dir);dir=path.posix.dirname(dir);}}
  next.createdDirectories=[...created].sort();
  const changedWrites=[...writes].filter(([name,bytes])=>!fs.existsSync(path.join(p.root,name))||sha(fs.readFileSync(path.join(p.root,name)))!==sha(bytes));
  const changedLinks=[...links].filter(([name,record])=>!p.managed.links[name]||p.managed.links[name].target!==record.target);
  const removedLinks=Object.keys(p.managed.links).filter(name=>!next.links[name]);
  const result={operations,writeFiles:changedWrites.length,removeFiles:deletes.size,writeLinks:changedLinks.length,removeLinks:removedLinks.length,dryRun:dryRun||!yes};
  if(dryRun||!yes)return result;
  if(!changedWrites.length&&!deletes.size&&!changedLinks.length&&!removedLinks.length&&JSON.stringify(next)===JSON.stringify(p.managed))return {...result,noOp:true};
  const transactionId=sha(p.root).slice(0,24),journal=at(`.state/project-transactions/${transactionId}.json`);
  if(fs.existsSync(journal))throw new Error('An interrupted project transaction requires recovery; see its private journal');
  const backups=[];
  for(const name of new Set([...touched,...removedLinks,...changedLinks.map(([name])=>name),'.agents/skills/brain.source.json'])){const file=path.join(p.root,name);let stat;try{stat=fs.lstatSync(file);}catch(e){if(e.code!=='ENOENT')throw e;}backups.push({path:name,kind:stat?.isSymbolicLink()?'link':stat?'file':'missing',data:stat?.isSymbolicLink()?fs.readlinkSync(file):stat?fs.readFileSync(file).toString('base64'):null});}
  const after=backups.map(b=>{
    if(b.path==='.agents/skills/brain.source.json')return {path:b.path,kind:Object.keys(next.skills).length?'file':'missing',sha256:sha(JSON.stringify(next,null,2)+'\n')};
    if(next.links[b.path])return {path:b.path,kind:'link',data:next.links[b.path].target};
    if(writes.has(b.path))return {path:b.path,kind:'file',sha256:sha(writes.get(b.path))};
    return {path:b.path,kind:'missing'};
  });
  writeJSON(journal,{root:p.root,backups,after,createdDirectories:next.createdDirectories,startedAt:now()},0o600);
  try {
    for(const name of removedLinks)fs.unlinkSync(path.join(p.root,name));
    for(const name of deletes)fs.unlinkSync(path.join(p.root,name));
    for(const [name,bytes]of changedWrites)atomic(path.join(p.root,name),bytes);
    for(const [name,record]of changedLinks){const file=path.join(p.root,name);mkdir(path.dirname(file));if(fs.existsSync(file))fs.unlinkSync(file);fs.symlinkSync(record.target,file,'dir');}
    if(Object.keys(next.skills).length)writeJSON(p.manifestPath,next);else fs.rmSync(p.manifestPath,{force:true});
    removeEmptyCreated(p.root,next.createdDirectories);fs.rmSync(journal);
    const enrolled=readJSON(at('.state/enrolled-projects.json'),[]).filter(root=>root!==p.root);if(Object.keys(next.skills).length)enrolled.push(p.root);writeJSON(at('.state/enrolled-projects.json'),enrolled.sort(),0o600);
    return {...result,dryRun:false};
  }catch(error){
    try{recover(p.root,{yes:true});}catch{throw new Error('Project operation interrupted; a private recovery journal preserves the original state. Run skills recover for this project.');}throw error;
  }
}
function removeEmptyCreated(root,dirs) {
  for(const name of [...dirs].sort((a,b)=>b.length-a.length)){safePath(name);if(!/^\.(?:agents|claude)(?:\/|$)/.test(name))throw new Error('Invalid created-directory record');const dir=path.join(root,name);noSymlinks(root,dir);if(fs.existsSync(dir)&&fs.lstatSync(dir).isDirectory()&&!fs.readdirSync(dir).length)fs.rmdirSync(dir);}
}
export function recover(input,{yes=false,dryRun=false,workspace}={}) {
  const root=projectDirectory(input,workspace),file=at(`.state/project-transactions/${sha(root).slice(0,24)}.json`),journal=readJSON(file,null);
  if(!journal)return {recoveryNeeded:false};if(journal.root!==root||!Array.isArray(journal.after))throw new Error('Invalid recovery journal');
  for(const backup of journal.backups){managedPath(backup.path);const target=path.join(root,backup.path);noSymlinks(root,path.dirname(target));let stat;try{stat=fs.lstatSync(target);}catch(e){if(e.code!=='ENOENT')throw e;}
    const actual=!stat?{kind:'missing'}:stat.isSymbolicLink()?{kind:'link',data:fs.readlinkSync(target)}:stat.isFile()?{kind:'file',sha256:sha(fs.readFileSync(target))}:{kind:'directory'};
    const before={kind:backup.kind,data:backup.data,sha256:backup.kind==='file'?sha(Buffer.from(backup.data,'base64')):null},after=journal.after.find(a=>a.path===backup.path);
    const same=expected=>expected&&actual.kind===expected.kind&&(actual.kind==='missing'||actual.kind==='file'&&actual.sha256===expected.sha256||actual.kind==='link'&&actual.data===expected.data);
    if(!same(before)&&!same(after))throw new Error('Recovery would overwrite a subsequent local change; journal retained');
  }
  const result={recoveryNeeded:true,files:journal.backups.length,dryRun:dryRun||!yes};if(dryRun||!yes)return result;
  for(const backup of [...journal.backups].reverse()){const target=path.join(root,backup.path);fs.rmSync(target,{force:true});if(backup.kind==='file')atomic(target,Buffer.from(backup.data,'base64'));else if(backup.kind==='link'){mkdir(path.dirname(target));fs.symlinkSync(backup.data,target,'dir');}}
  removeEmptyCreated(root,journal.createdDirectories||[]);fs.rmSync(file);return {...result,dryRun:false,recovered:true};
}
