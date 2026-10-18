import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {at,ROOT,config,walk,inside,safePath,json,sha} from './core.mjs';
import {assertClean} from './privacy.mjs';
import {checkOfficial,historicalCacheGaps,lock,snapshotRoot,registry} from './official.mjs';
import {validateKnowledge,isNote,curatedBlock,CURATED} from './guidance.mjs';
const require=createRequire(import.meta.url);
const {splitFrontmatter,scalar}=require('../wiki/lib/frontmatter.cjs');
const {collect}=require('../wiki/lib/wiki-graph.cjs');

export function check({staged=false}={}) {
  const issues=[],warnings=[],entries=[];
  if(staged) {
    const list=spawnSync('git',['ls-files','--stage','-z'],{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024});
    if(list.status!==0)throw new Error('Could not read staged index');
    for(const record of list.stdout.split('\0').filter(Boolean)) {
      const match=record.match(/^(\d+) ([0-9a-f]+) (\d)\t([\s\S]+)$/);if(!match)throw new Error('Invalid staged index entry');
      const [,mode,oid,stage,name]=match;
      if(stage!=='0'){issues.push('Unmerged index entries');continue;}
      safePath(name);
      if(/^(?:inbox\/|\.state\/|brain\.config\.local\.json$)/.test(name)){issues.push('Private content is staged');continue;}
      if(mode!=='100644'&&mode!=='100755'){issues.push(`Unsupported staged file type: ${name}`);continue;}
      const result=spawnSync('git',['cat-file','blob',oid],{cwd:ROOT,maxBuffer:64*1024*1024});
      if(result.status!==0)throw new Error('Could not read staged blob');
      if(result.stdout.length>1024*1024&&name.startsWith('official/'))issues.push('Oversized vendor file is staged');
      entries.push({id:name,bytes:result.stdout});
    }
  } else {
    const configFiles=['README.md','STATUS.md','AGENTS.md','CLAUDE.md','brain.config.json','official/sources.json','official/sources.lock.json','official/CHANGES.md','.gitignore'];
    for(const name of configFiles)if(fs.existsSync(at(name)))entries.push({id:name,bytes:fs.readFileSync(at(name))});
    for(const name of ['knowledge','skills','wiki','scripts','launchd','.githooks','.github'])for(const file of walk(at(name)))entries.push({id:path.relative(ROOT,file),bytes:fs.readFileSync(file)});
    for(const file of walk(at('official/manifests'),{file:f=>f.endsWith('.json')})){
      const manifest=json(file);entries.push({id:path.relative(ROOT,file),bytes:fs.readFileSync(file)});
      for(const record of manifest.files){const source=path.join(snapshotRoot(manifest),record.path);if(fs.existsSync(source)&&/\.(?:md|mdx|txt|json|ya?ml|[cm]?[jt]sx?)$/i.test(record.path))entries.push({id:path.relative(ROOT,source),bytes:fs.readFileSync(source)});}
    }
  }
  const vendor=entries.filter(e=>e.id.startsWith('official/snapshots/')),personal=entries.filter(e=>!e.id.startsWith('official/snapshots/'));
  if(staged)for(const entry of vendor){const parts=entry.id.split('/'),name=`official/manifests/${parts[2]}/${parts[3]}.json`,record=entries.find(e=>e.id===name);if(!record){issues.push('Staged vendor content requires its snapshot manifest');continue;}const manifest=JSON.parse(record.bytes),file=manifest.files.find(f=>f.path===parts.slice(4).join('/'));if(!file||sha(entry.bytes)!==file.sha256)issues.push('Staged vendor content differs from its snapshot manifest');}
  try{assertClean(personal);}catch(error){issues.push(error.message);}
  const exceptions=[];
  for(const entry of vendor){const parts=entry.id.split('/'),source=registry().sources.find(s=>s.id===parts[2]);for(const exception of source?.scanExceptions||[])if(exception.path===parts.slice(4).join('/'))exceptions.push({...exception,path:entry.id});}
  try{assertClean(vendor,{clients:false,exceptions});}catch(error){issues.push(error.message);}
  issues.push(...validateKnowledge(entries.filter(e=>e.id.startsWith('knowledge/')&&e.id.endsWith('.md')&&!e.id.includes('/_templates/'))));
  const notes=entries.filter(e=>isNote(e.id)).map(e=>({path:e.id,raw:splitFrontmatter(e.bytes.toString()).raw,valid:!validateKnowledge([e]).length}));
  for(const note of notes)if(scalar(note.raw,'status')==='superseded'){const target=scalar(note.raw,'superseded_by');if(!notes.some(candidate=>candidate.path===target))issues.push(`${note.path}: superseded replacement has no published content`);}
  // Hubs must link exactly the current notes these bytes would publish.
  for(const domain of config().domains){const hub=`knowledge/${domain}/INDEX.md`,block=entries.find(e=>e.id===hub)?.bytes.toString().match(CURATED)?.[0];if(block&&block!==curatedBlock(domain,notes.filter(note=>note.valid)))issues.push(`${hub}: curated links are out of date; run curation hubs`);}
  if(!staged) {
    for(const issue of checkOfficial())(issue.endsWith('no active snapshot')?warnings:issues).push(issue);
    const historicalGaps=historicalCacheGaps();if(historicalGaps.length)warnings.push(`${historicalGaps.length} historical cached files unavailable; active and present bytes remain checked`);
    try{collect(ROOT,{wikiRoot:'knowledge'});}catch(error){issues.push(error.message);}
    const approved=new Set();for(const entry of Object.values(lock().sources))for(const record of entry.files)approved.add(path.join(snapshotRoot(entry),record.path));
    for(const {id,bytes} of entries.filter(e=>e.id.startsWith('knowledge/')&&e.id.endsWith('.md')&&!e.id.includes('/_templates/'))) {
      const text=splitFrontmatter(bytes.toString()).body.replace(/```[\s\S]*?```/g,'');
      for(const match of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
        const href=match[1];if(/^(?:[a-z][\w+.-]*:|#)/i.test(href))continue;
        let target;try{target=path.resolve(path.dirname(at(id)),decodeURIComponent(href.split(/[?#]/)[0]));}catch{issues.push(`${id}: invalid link encoding`);continue;}
        const authority=(config().authorities||[]).some(a=>inside(path.resolve(ROOT,a.path),target));
        if((!inside(ROOT,target)&&!authority)||inside(at('.state'),target)||inside(at('inbox'),target)){issues.push(`${id}: link leaves public brain content`);continue;}
        if(authority&&!fs.existsSync(target)){warnings.push(`${id}: an authority checkout is unavailable`);continue;}
        if(!fs.existsSync(target))issues.push(`${id}: missing local link target`);
        if(inside(at('official/snapshots'),target)&&!approved.has(target)) {
          // Older retained snapshots remain valid when their manifests and hashes are available.
          const relative=path.relative(at('official/snapshots'),target).split(path.sep),[source,snapshot]=relative;
          if(!fs.existsSync(at(`official/manifests/${source}/${snapshot}.json`)))issues.push(`${id}: unregistered snapshot reference`);
        }
      }
    }
    for(const file of walk(ROOT,{skip:(full,entry)=>entry.isDirectory()&&['.git','.state','inbox'].includes(entry.name)})) {
      const components=path.relative(ROOT,file).split(path.sep);
      if(components.some(p=>['.agents','.claude','.cursor','.codex'].includes(p)))issues.push('Brain contains a tool-discovered directory');
    }
    for(const privateFile of ['brain.config.local.json','.state','inbox'])if(fs.existsSync(at(privateFile))&&(fs.statSync(at(privateFile)).mode&0o077))issues.push('Private storage permissions are too broad');
  }
  return {ok:!issues.length,issues:[...new Set(issues)],warnings:[...new Set(warnings)],filesScanned:entries.length};
}
