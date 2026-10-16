import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {at,config,json,readJSON,writeJSON,atomic,sha,now,mkdir,object,safePath,inside,noSymlinks,walk,log} from './core.mjs';
import {api,download,markdownResponse} from './network.mjs';
import {archive} from './archive.mjs';
import {assertClean} from './privacy.mjs';
import {fetchDocumentationCatalog} from './documentation.mjs';
import {staleGuidance} from './guidance.mjs';
const require=createRequire(import.meta.url);
const {splitFrontmatter,scalar}=require('../wiki/lib/frontmatter.cjs');

export const registry=()=>json(at('official/sources.json'));
export const lock=()=>readJSON(at('official/sources.lock.json'),{schemaVersion:1,sources:{},toolchain:{}});
export const fingerprint=spec=>sha(JSON.stringify(spec));
export function requireRegistryApproval(){const approval=readJSON(at('.state/registry-approval.json'),{});if(approval.sha256!==sha(fs.readFileSync(at('official/sources.json'))))throw new Error('Source registry changed without an approved proposal');}
const selected=(source,name)=>source.paths.some(rule=>rule.exact===name || rule.prefix && name.startsWith(rule.prefix));
function mapped(spec,name) {
  for(const rule of spec.mappings||[])if(name.startsWith(rule.from))return safePath(rule.to+name.slice(rule.from.length));
  return safePath(name);
}
export function snapshotRoot(entry){if(!/^[a-z0-9][a-z0-9-]*$/.test(entry.id)||!/^[a-f0-9]{12}-[a-f0-9]{12}$/.test(entry.snapshot))throw new Error('Invalid snapshot identity');return at(`official/snapshots/${entry.id}/${entry.snapshot}`);}
const manifestFile=entry=>at(`official/manifests/${entry.id}/${entry.snapshot}.json`);
export function snapshotFiles(entry) {
  const root=snapshotRoot(entry),files=new Map();noSymlinks(at('official'),root);
  for(const record of entry.files) {
    safePath(record.path);const file=path.join(root,record.path);noSymlinks(root,file);
    if(!fs.existsSync(file))throw new Error(`Missing snapshot file in ${entry.id}; cached bytes must be restored explicitly`);
    const bytes=fs.readFileSync(file);if(sha(bytes)!==record.sha256)throw new Error(`Managed snapshot modified: ${entry.id}/${record.path}`);
    files.set(record.path,bytes);
  }
  const known=new Set(entry.files.map(f=>f.path));
  for(const file of walk(root))if(!known.has(path.relative(root,file).split(path.sep).join('/')))throw new Error(`Unexpected snapshot file in ${entry.id}`);
  return files;
}
function detectLicense(files) {
  const declarations=[];
  for(const [name,bytes] of files) {
    if(/(?:^|\/)LICENSE(?:[-.][^/]*)?$/i.test(name))declarations.push({path:name,sha256:sha(bytes)});
    if(name.endsWith('SKILL.md')){const value=scalar(splitFrontmatter(bytes.toString()).raw,'license');if(value)declarations.push({path:name,license:value});}
  }
  return declarations.sort((a,b)=>a.path.localeCompare(b.path));
}
function catalog(spec,files) {
  const skills=[];
  const skillRoot=spec.skillRoot?mapped(spec,spec.skillRoot+'entry').slice(0,-5):null;
  for(const [name,bytes] of files) {
    if(!/(?:^|\/)SKILL\.md$/.test(name))continue;
    if(skillRoot&&(!name.startsWith(skillRoot)||name.slice(skillRoot.length).split('/').length!==2))continue;
    const directory=path.posix.dirname(name),folder=path.posix.basename(directory),parsed=splitFrontmatter(bytes.toString());
    if(!scalar(parsed.raw,'name')||!scalar(parsed.raw,'description'))throw new Error(`Invalid skill frontmatter in ${spec.id}`);
    const installable=spec.installPolicy==='portable' || spec.installPolicy==='sitecore-bundle' || spec.installPolicy==='curated' && spec.installableSkills.includes(folder);
    const applies=spec.id==='vercel-plugin' ? {dependencies:[folder==='nextjs'?'next':'react']} : spec.appliesTo;
    skills.push({id:`${spec.id}/${folder}`,name:folder,declaredName:scalar(parsed.raw,'name'),description:scalar(parsed.raw,'description'),directory,installable,policy:spec.installPolicy,appliesTo:applies,preferred:!!spec.preferred});
  }
  return skills.sort((a,b)=>a.id.localeCompare(b.id));
}
export function refreshCatalogs() {
  requireRegistryApproval();const current=lock(),changed=[];
  for(const spec of registry().sources){const entry=current.sources[spec.id];if(!entry)continue;const files=snapshotFiles(entry),skills=catalog(spec,files),references=relativeProblems(spec,files,skills);if(entry.catalogVersion===3&&JSON.stringify(entry.skills)===JSON.stringify(skills)&&JSON.stringify(entry.referenceIssues)===JSON.stringify(references))continue;entry.skills=skills;entry.referenceIssues=references;entry.catalogVersion=3;const manifest=readJSON(manifestFile(entry),entry);writeJSON(manifestFile(entry),{...manifest,skills,referenceIssues:references,catalogVersion:3});changed.push(spec.id);}
  const cached=[];
  // Preserve bytes and hashes using the established cache/restore path for
  // oversized files and full exports superseded by link-only catalogs.
  for(const name of walk(at('official/manifests'),{file:f=>f.endsWith('.json')})){
    const manifest=json(name),spec=registry().sources.find(source=>source.id===manifest.id);
    const retained=manifest.files.filter(file=>!file.cached&&(file.bytes>1024*1024||spec?.catalogOnly&&manifest.mode!=='link-catalog'&&!/^(?:INDEX\.md|ATTRIBUTION\.md|LICENSE(?:[-.][^/]*)?)$/i.test(file.path)));
    if(!retained.length)continue;
    const files=snapshotFiles(manifest);
    for(const record of retained){object(files.get(record.path));record.cached=true;cached.push(`${manifest.id}/${manifest.snapshot}/${record.path}`);}
    writeJSON(name,manifest);
    if(current.sources[manifest.id]?.snapshot===manifest.snapshot)current.sources[manifest.id].files=manifest.files;
  }
  writeJSON(at('official/sources.lock.json'),current);generateHubs();updateIgnores();return {changed,cached};
}
function relativeProblems(spec,files,skills) {
  const problems=[];
  const names=[...files.keys()];
  for(const [name,bytes] of files) {
    if(!/\.(?:md|mdx)$/i.test(name))continue;
    const text=splitFrontmatter(bytes.toString()).body.replace(/```[\s\S]*?```/g,'');
    for(const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
      const href=match[1].replace(/^<|>$/g,'');
      if(/^(?:[a-z][\w+.-]*:|#|\/)/i.test(href)||/[<>${}*]/.test(href))continue;
      let target;try{target=path.posix.normalize(path.posix.join(path.posix.dirname(name),decodeURIComponent(href.split(/[?#]/)[0])));}catch{continue;}
      if(target.startsWith('../') || !files.has(target)&&!files.has(target+'.md')&&!names.some(n=>n.startsWith(target.replace(/\/$/,'')+'/')))problems.push({from:name,target});
    }
  }
  for(const skill of skills) {
    const required=problems.filter(p=>p.from===skill.directory+'/SKILL.md');
    const warnings=problems.filter(p=>p.from.startsWith(skill.directory+'/')&&p.from!==skill.directory+'/SKILL.md');
    if(warnings.length)skill.referenceWarnings=warnings.length;
    if(required.length){skill.installable=false;skill.blockedReason=`${required.length} unresolved entry-point references`;}
  }
  return problems;
}
async function resolve(spec,seed) {
  if(seed){if(spec.seedRevision)return spec.seedRevision;throw new Error('Seed revision unresolved; verify the version-to-commit mapping first');}
  if(spec.track==='pinned'){if(!/^[0-9a-f]{40}$/.test(spec.revision||''))throw new Error('Pinned source requires a full commit');return spec.revision;}
  let ref;
  if(spec.track==='latest-release'){const release=await api(`repos/${spec.repository}/releases/latest`);if(release.prerelease||release.draft)throw new Error('No stable release');ref=release.tag_name;}
  else if(spec.track==='default-branch'){const metadata=await api(`repos/${spec.repository}`);if(metadata.full_name.toLowerCase()!==spec.repository.toLowerCase())throw new Error('Repository identity changed');ref=metadata.default_branch;}
  else throw new Error('Unknown source tracking policy');
  const commit=await api(`repos/${spec.repository}/commits/${encodeURIComponent(ref)}`);
  if(!/^[0-9a-f]{40}$/.test(commit.sha))throw new Error('Could not resolve immutable commit');
  return commit.sha;
}
export async function fetchSource(spec,{seed=false}={}) {
  if(!/^[a-z0-9][a-z0-9-]*$/.test(spec.id))throw new Error('Invalid source ID');
  let files,revision,url,rawArchive;
  if(spec.catalogOnly) {
    const resolved=spec.kind==='repository'?await resolve(spec,seed):null;
    ({files,revision,url}=await fetchDocumentationCatalog(spec,resolved));
  } else if(spec.kind==='repository') {
    revision=await resolve(spec,seed);url=`https://codeload.github.com/${spec.repository}/tar.gz/${revision}`;
    const response=await download(url,{hosts:['codeload.github.com'],maxBytes:config().network.maxDownloadBytes});rawArchive=response.bytes;
    const base=spec.sourceBase||'';
    const rawFiles=archive(rawArchive,{select:name=>name.startsWith(base)&&selected(spec,name.slice(base.length))});
    const upstream=new Map([...rawFiles].map(([name,bytes])=>[name.slice(base.length),bytes]));
    if(seed){for(const expected of spec.seedFiles||[]){const bytes=upstream.get(expected.path);if(!bytes||sha(bytes)!==expected.sha256)throw new Error(`Seed hash parity failed for ${spec.id}/${expected.path}`);}}
    for(const rule of spec.paths){if(rule.required===false)continue;if(rule.prefix && ![...upstream.keys()].some(n=>n.startsWith(rule.prefix)))throw new Error(`Approved upstream path disappeared: ${spec.id}/${rule.prefix}`);}
    files=new Map();for(const [name,bytes] of upstream){const destination=mapped(spec,name);if(destination.split('/').some(p=>['.agents','.claude','.cursor','.codex','.git'].includes(p)))throw new Error('Source mapping would create a tool directory');if(files.has(destination))throw new Error('Colliding source path mapping');files.set(destination,bytes);}
  } else if(spec.kind==='url') {
    const response=await download(spec.url,{hosts:spec.allowedHosts,maxBytes:config().network.maxDownloadBytes,headers:{accept:'text/markdown, text/plain;q=0.9'}});
    markdownResponse(response);files=new Map([[safePath(spec.filename||'docs.md'),response.bytes]]);revision=sha(response.bytes);url=response.url;
    if(spec.licenseFile){const license=await download(spec.licenseFile.url,{hosts:spec.licenseFile.allowedHosts,maxBytes:1024*1024});if(sha(license.bytes)!==spec.licenseFile.sha256)throw new Error('Documentation license checksum changed');files.set('LICENSE.txt',license.bytes);}
  } else throw new Error('Unsupported source kind');
  const records=[...files].map(([name,bytes])=>({path:name,sha256:sha(bytes),bytes:bytes.length,cached:bytes.length>1024*1024||!spec.catalogOnly&&!!spec.privateOnly&&!['INDEX.md','ATTRIBUTION.md'].includes(name)})).sort((a,b)=>a.path.localeCompare(b.path));
  const licenses=detectLicense(files);
  if(spec.kind==='repository'&&!licenses.length)throw new Error(`No license or license declaration found for ${spec.id}`);
  const skills=catalog(spec,files),references=relativeProblems(spec,files,skills);
  // Individual upstream relative-link defects make a skill reference-only, not silently repaired.
  const digest=sha(JSON.stringify(records));
  return {files,entry:{id:spec.id,revision,snapshot:`${revision.slice(0,12)}-${digest.slice(0,12)}`,repository:spec.repository||null,url,track:spec.track||'rolling-url',mode:spec.catalogOnly?'link-catalog':'snapshot',license:spec.license,licenses,policySha256:fingerprint(spec),catalogVersion:3,files:records,skills,referenceIssues:references,domains:spec.domains,seedParity:seed?{verified:true,verificationScope:'selected upstream files',files:spec.seedFiles?.length||0,archiveSha256:rawArchive?sha(rawArchive):null,archiveExpectedSha256:spec.seedArchiveSha256||null,archiveMatchesExpected:!!rawArchive&&sha(rawArchive)===spec.seedArchiveSha256}:null}};
}
function publish(entry,files) {
  const root=snapshotRoot(entry);noSymlinks(at('official'),root);
  if(fs.existsSync(root)){snapshotFiles(entry);return;}
  mkdir(at('.state/staging'),0o700);const stage=fs.mkdtempSync(at('.state/staging/official-'));
  try{for(const record of entry.files){const bytes=files.get(record.path);object(bytes);atomic(path.join(stage,record.path),bytes);}mkdir(path.dirname(root));fs.renameSync(stage,root);}
  finally{fs.rmSync(stage,{recursive:true,force:true});}
  writeJSON(at(`.state/snapshots/${entry.id}/${entry.snapshot}.json`),entry,0o600);
  writeJSON(manifestFile(entry),entry);
}
function licenseKey(entry){return JSON.stringify({files:entry.licenses.filter(l=>l.sha256),declarations:[...new Set(entry.licenses.filter(l=>l.license).map(l=>l.license))].sort()});}
export async function sync({seed=false,ids=null,dueOnly=false}={}) {
  requireRegistryApproval();
  const specs=registry().sources.filter(s=>ids?ids.includes(s.id):s.refresh!==false);
  if(ids?.some(id=>!specs.some(s=>s.id===id)))throw new Error('Unknown official source ID');
  const current=lock(),state=readJSON(at('.state/official-runs.json'));
  const changed=[],failed=[],unchanged=[];
  for(const spec of specs) {
    const previous=current.sources[spec.id];const run=state[spec.id]||{};
    if(dueOnly && run.policySha256===fingerprint(spec) && (run.nextAttemptAt && Date.parse(run.nextAttemptAt)>Date.now() || run.lastSuccess && Date.now()-Date.parse(run.lastSuccess)<(config().official?.refreshHours??20)*3600000))continue;
    try {
      if(previous){snapshotFiles(previous);if(previous.policySha256!==fingerprint(spec))throw new Error('Registry policy changed; apply it through an approved proposal');}
      const result=await fetchSource(spec,{seed});
      if(previous && licenseKey(previous)!==licenseKey(result.entry)){writeJSON(at(`.state/license-reviews/${spec.id}.json`),{source:spec.id,revision:result.entry.revision,previous:previous.licenses,observed:result.entry.licenses,at:now(),status:'recorded-automatic-refresh'},0o600);log('official-license-change',{id:spec.id,status:'recorded'});}
      if(previous?.snapshot===result.entry.snapshot){
        if(previous.catalogVersion!==3||JSON.stringify(previous.skills)!==JSON.stringify(result.entry.skills)||JSON.stringify(previous.referenceIssues)!==JSON.stringify(result.entry.referenceIssues)){
          previous.skills=result.entry.skills;previous.referenceIssues=result.entry.referenceIssues;previous.catalogVersion=3;
          writeJSON(at('official/sources.lock.json'),current);
          const manifest=readJSON(manifestFile(previous),previous);
          writeJSON(manifestFile(previous),{...manifest,skills:previous.skills,referenceIssues:previous.referenceIssues,catalogVersion:3});
        }
        unchanged.push(spec.id);
      }
      else {
        assertClean([...result.files].filter(([name])=>/\.(?:md|mdx|txt|json|ya?ml|[cm]?[jt]sx?)$/i.test(name)).map(([name,bytes])=>({id:name,bytes})),{clients:false,exceptions:spec.scanExceptions||[]});
        result.entry.fetchedAt=now();publish(result.entry,result.files);
        if(previous){result.entry.history=[{snapshot:previous.snapshot,revision:previous.revision},...(previous.history||[])].filter((x,i,a)=>a.findIndex(y=>y.snapshot===x.snapshot)===i).slice(0,2);}
        current.sources[spec.id]=result.entry;
        changed.push({id:spec.id,from:previous?.revision||null,to:result.entry.revision,added:result.entry.files.filter(f=>!previous?.files.some(p=>p.path===f.path)).length,removed:previous?.files.filter(f=>!result.entry.files.some(p=>p.path===f.path)).length||0,modified:result.entry.files.filter(f=>previous?.files.some(p=>p.path===f.path&&p.sha256!==f.sha256)).length});
        writeJSON(at('official/sources.lock.json'),current);
      }
      state[spec.id]={lastAttempt:now(),lastSuccess:now(),policySha256:fingerprint(spec),failures:0};
      log('official-source',{id:spec.id,status:changed.some(c=>c.id===spec.id)?'changed':'unchanged'});
    }catch(error){
      const failures=(run.failures||0)+1;
      state[spec.id]={...run,lastAttempt:now(),policySha256:fingerprint(spec),failures,nextAttemptAt:new Date(Date.now()+Math.min(24,2**Math.min(failures,4))*3600000).toISOString(),error:error.message};
      failed.push({id:spec.id,error:error.message});log('official-source',{id:spec.id,status:'failed',reason:error.message});
    }
    writeJSON(at('.state/official-runs.json'),state,0o600);
  }
  if(changed.length)atomic(at('official/CHANGES.md'),`# Official source changes\n\nUpdated ${now()}. No automatic commits.\n\n`+changed.map(c=>`- **${c.id}**: \`${c.from||'initial'}\` → \`${c.to}\`; ${c.added} added, ${c.modified} modified, ${c.removed} removed.`).join('\n')+'\n');
  generateHubs();pruneSnapshots();updateIgnores();
  const report={changed,unchanged,failed};writeJSON(at('.state/last-sync.json'),report,0o600);return report;
}
export function officialSections() {
  const active=lock(),reg=registry(),sections={};
  for(const domain of config().domains){
    const lines=['## Official sources',''];
    for(const spec of reg.sources.filter(s=>s.domains.includes(domain))) {
      const entry=active.sources[spec.id];
      if(!entry){lines.push(`- ${spec.id}: not available locally; see [upstream](${spec.repository?'https://github.com/'+spec.repository:spec.url}).`);continue;}
      const base=`official/snapshots/${entry.id}/${entry.snapshot}`,hub=at(`knowledge/${domain}/INDEX.md`);
      const rel=file=>path.relative(path.dirname(hub),at(base+'/'+file)).split(path.sep).join('/');
      const coverage=entry.mode==='link-catalog'?'link catalog; page bodies not mirrored':spec.refresh===false?'retained snapshot; automatic refresh disabled':'selected reference snapshot';
      lines.push(`- **${entry.id}** — ${coverage}; ${entry.track}; revision \`${entry.revision}\`; fetched ${entry.fetchedAt?.slice(0,10)||'unknown'}.`);
      for(const skill of entry.skills)lines.push(`  - [${skill.name}](${rel(skill.directory+'/SKILL.md')})${skill.installable?'':' — reference only'}.`);
      if(!entry.skills.length || entry.files.some(f=>f.path.startsWith('docs/'))) {
        const docs=entry.files.filter(f=>/\.(?:md|mdx|txt)$/.test(f.path)&&!f.path.includes('/SKILL.md')&&!/LICENSE/i.test(f.path)).slice(0,8);
        for(const doc of docs){let upstream=spec.url;if(spec.kind==='repository'){let original=doc.path;for(const rule of spec.mappings||[])if(original.startsWith(rule.to)){original=rule.from+original.slice(rule.to.length);break;}upstream=`https://github.com/${spec.repository}/blob/${entry.revision}/${spec.sourceBase||''}${original}`;}lines.push(doc.cached?`  - [${doc.path}](${upstream||spec.indexUrl}) — upstream; restore the exact local snapshot with \`official restore ${entry.id}\`.`:`  - [${doc.path}](${rel(doc.path)}).`);}
      }
    }
    for(const pointer of reg.pointers.filter(p=>p.domain===domain))lines.push(`- [Official website](${pointer.url}) — pointer only: ${pointer.reason}`);
    sections[domain]=lines.join('\n')+'\n';
  }
  return sections;
}
export function generateHubs() {
  for(const [domain,section] of Object.entries(officialSections())) {
    const file=at(`knowledge/${domain}/INDEX.md`);const text=fs.readFileSync(file,'utf8');
    if(!text.includes('<!-- brain:official:start -->')||!text.includes('<!-- brain:official:end -->'))throw new Error('Domain hub is missing managed markers');
    let result=text.replace(/<!-- brain:official:start -->[\s\S]*?<!-- brain:official:end -->/,`<!-- brain:official:start -->\n${section}<!-- brain:official:end -->`);
    if(result.includes('<!-- brain:curated:start -->')){
      const approvals=readJSON(at('knowledge/approvals.json'),{pages:{}}),pages=[];
      for(const [relative,approval]of Object.entries(approvals.pages)){if(!relative.startsWith(`knowledge/${domain}/`)||relative.endsWith('/INDEX.md'))continue;const page=at(relative);if(!fs.existsSync(page)||sha(fs.readFileSync(page))!==approval.sha256)continue;const parsed=splitFrontmatter(fs.readFileSync(page,'utf8'));if(['superseded','retired'].includes(scalar(parsed.raw,'status')))continue;const title=scalar(parsed.raw,'title');const href=path.relative(path.dirname(file),page).split(path.sep).join('/');pages.push(`- [${title.replace(/[\[\]]/g,'')}](${href})`);}
      result=result.replace(/<!-- brain:curated:start -->[\s\S]*?<!-- brain:curated:end -->/,`<!-- brain:curated:start -->\n${pages.length?pages.sort().join('\n'):'No approved learnings yet.'}\n<!-- brain:curated:end -->`);
    }
    if(result!==text)atomic(file,result);
  }
  staleGuidance({limit:100,write:true});
}
export function updateIgnores() {
  const file=at('.gitignore'),text=fs.readFileSync(file,'utf8'),base=text.replace(/\n# brain:large:start[\s\S]*?# brain:large:end\n?/,'\n').trimEnd();
  const cached=[];
  for(const entry of Object.values(lock().sources))for(const record of entry.files.filter(f=>f.cached))cached.push(`/official/snapshots/${entry.id}/${entry.snapshot}/${record.path}`);
  // Also retain ignored materializations from older snapshots.
  for(const manifest of walk(at('official/manifests'),{file:f=>f.endsWith('.json')})){const entry=json(manifest);for(const record of entry.files.filter(f=>f.cached))cached.push(`/official/snapshots/${entry.id}/${entry.snapshot}/${record.path}`);}
  const result=base+'\n\n# brain:large:start\n'+[...new Set(cached)].sort().join('\n')+'\n# brain:large:end\n';if(result!==text)atomic(file,result);
}
function pruneSnapshots() {
  const active=lock(),retained=new Set();
  for(const entry of Object.values(active.sources)){retained.add(`${entry.id}/${entry.snapshot}`);for(const old of entry.history||[])retained.add(`${entry.id}/${old.snapshot}`);}
  const referenceText=[...walk(at('knowledge'),{file:f=>f.endsWith('.md')}),...walk(at('.state/proposals'),{file:f=>f.endsWith('.json')})].map(f=>fs.readFileSync(f,'utf8')).join('\n');
  for(const file of walk(at('official/manifests'),{file:f=>f.endsWith('.json')})){
    const entry=json(file),key=`${entry.id}/${entry.snapshot}`;
    if(retained.has(key)||referenceText.includes(entry.snapshot))continue;
    try{snapshotFiles(entry);}catch{log('snapshot-retention',{id:entry.id,status:'preserved-modified-snapshot'});continue;}
    fs.rmSync(snapshotRoot(entry),{recursive:true});fs.rmSync(file);fs.rmSync(at(`.state/snapshots/${entry.id}/${entry.snapshot}.json`),{force:true});
  }
  const used=new Set();
  for(const file of walk(at('official/manifests'),{file:f=>f.endsWith('.json')}))for(const record of json(file).files)used.add(record.sha256);
  if(fs.existsSync(at('.state/objects')))for(const digest of fs.readdirSync(at('.state/objects')))if(/^[0-9a-f]{64}$/.test(digest)&&!used.has(digest))fs.rmSync(at('.state/objects/'+digest));
}
export function rollback(id) {
  const current=lock(),entry=current.sources[id];if(!entry?.history?.length)throw new Error('No retained earlier snapshot');
  snapshotFiles(entry);const previous=readJSON(at(`official/manifests/${id}/${entry.history[0].snapshot}.json`),null);if(!previous)throw new Error('Previous snapshot manifest unavailable');
  if(previous.policySha256!==entry.policySha256)throw new Error('Rollback refused: previous snapshot uses a different registry policy; active snapshot retained');
  snapshotFiles(previous);previous.history=[{snapshot:entry.snapshot,revision:entry.revision},...(previous.history||[])].slice(0,2);current.sources[id]=previous;writeJSON(at('official/sources.lock.json'),current);generateHubs();updateIgnores();log('official-rollback',{id});
  return {id,revision:previous.revision};
}
export async function restore(id) {
  const entry=lock().sources[id],spec=registry().sources.find(s=>s.id===id);if(!entry||!spec)throw new Error('Unknown active source');
  if(entry.policySha256!==fingerprint(spec))throw new Error('Registry policy changed; approval is required');
  const root=snapshotRoot(entry);noSymlinks(at('official'),root);const missing=[];
  for(const record of entry.files){safePath(record.path);const file=path.join(root,record.path);noSymlinks(at('official'),file);if(fs.existsSync(file)){if(sha(fs.readFileSync(file))!==record.sha256)throw new Error('Restore refuses locally modified snapshot files');}else missing.push(record);}
  if(!missing.length)return {id,restored:0,noOp:true};
  let fetched=null;const recovered=new Map();
  for(const record of missing){const cached=at(`.state/objects/${record.sha256}`);if(fs.existsSync(cached)){const bytes=fs.readFileSync(cached);if(sha(bytes)!==record.sha256)throw new Error('Cached snapshot bytes are corrupt');recovered.set(record.path,bytes);}else{if(!fetched)fetched=await fetchSource(spec.kind==='repository'?{...spec,track:'pinned',revision:entry.revision}:spec);const bytes=fetched.files.get(record.path);if(!bytes||sha(bytes)!==record.sha256)throw new Error('Historical content unavailable: upstream no longer serves the recorded bytes');recovered.set(record.path,bytes);}}
  assertClean([...recovered].map(([id,bytes])=>({id,bytes})),{clients:false,exceptions:spec.scanExceptions||[]});
  for(const [name,bytes]of recovered){object(bytes);atomic(path.join(root,name),bytes);}if(!fs.existsSync(manifestFile(entry)))writeJSON(manifestFile(entry),entry);return {id,restored:missing.length};
}
export function checkOfficial() {
  const active=lock(),issues=[];
  try{requireRegistryApproval();}catch(error){issues.push(error.message);}
  for(const spec of registry().sources){const entry=active.sources[spec.id];if(!entry){issues.push(`${spec.id}: no active snapshot`);continue;}if(entry.policySha256!==fingerprint(spec))issues.push(`${spec.id}: registry differs from approved lock`);try{snapshotFiles(entry);}catch(error){issues.push(error.message);}}
  for(const file of walk(at('official/manifests'),{file:f=>f.endsWith('.json')})){try{snapshotFiles(json(file));}catch(error){issues.push(error.message);}}
  for(const [domain,section] of Object.entries(officialSections())){const actual=fs.readFileSync(at(`knowledge/${domain}/INDEX.md`),'utf8').match(/<!-- brain:official:start -->\n([\s\S]*?)<!-- brain:official:end -->/)?.[1];if(actual!==section)issues.push(`Stale official section: ${domain}`);}
  return issues;
}
