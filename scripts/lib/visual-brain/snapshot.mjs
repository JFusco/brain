// Read only allowlisted committed blobs. Never export Git internals or working edits.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {ROOT,sha,at,readJSON} from '../core.mjs';
import {validateKnowledge,guidanceState} from '../guidance.mjs';
const require=createRequire(import.meta.url);
const {splitFrontmatter,scalar,list}=require('../../wiki/lib/frontmatter.cjs');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,maxBuffer:48*1024*1024,stdio:['pipe','pipe','pipe']});
let cached;
export function mainRevision(){return git('rev-parse','--verify','refs/heads/main^{commit}').toString().trim();}
const allowed=name=>/^knowledge\/(?!.*(?:^|\/)_(?:templates)(?:\/|$)).+\.md$/.test(name)||['official/sources.json','official/sources.lock.json','brain.config.json'].includes(name)||/^official\/catalogs\/[a-z0-9-]+\.json$/.test(name);
export function nodeID(item){if(item.kind==='installed-documentation')return null;return item.url?`url:${sha(item.url)}`:item.path?.startsWith('knowledge/')?item.path:null;}
function https(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
export function snapshot(revision=mainRevision()) {
  if(cached?.revision===revision)return cached;
  if(!/^[a-f0-9]{40}$/.test(revision))throw new Error('Invalid knowledge snapshot');
  git('merge-base','--is-ancestor',revision,'refs/heads/main');
  const files=git('ls-tree','-r','-z',revision,'--','knowledge','official','brain.config.json').toString().split('\0').filter(Boolean).map(row=>{
    const m=row.match(/^(\d+) blob ([a-f0-9]+)\t(.+)$/);return m&&m[1]==='100644'&&allowed(m[3])?{id:m[3],oid:m[2]}:null;
  }).filter(Boolean);
  const totalLimit=48*1024*1024;
  const batch=execFileSync('git',['cat-file','--batch'],{cwd:ROOT,input:files.map(f=>f.oid).join('\n')+'\n',maxBuffer:totalLimit,stdio:['pipe','pipe','pipe']});
  const contents=new Map();let offset=0;
  for(const file of files){const end=batch.indexOf(10,offset),header=batch.subarray(offset,end).toString().split(' '),size=Number(header[2]);if(header[1]!=='blob'||size>4*1024*1024)throw new Error('Snapshot file exceeds its bound');contents.set(file.id,batch.subarray(end+1,end+1+size));offset=end+size+2;}
  const json=name=>JSON.parse(contents.get(name)?.toString()||'null');
  const config=json('brain.config.json'),registry=json('official/sources.json'),lock=json('official/sources.lock.json');
  if(!config||!registry||!lock)throw new Error('Committed knowledge metadata is missing');
  const nodes=new Map(),entries=[],bodies=new Map(),edges=[],edgeKeys=new Set();
  function addNode(n){const prior=nodes.get(n.id);if(prior){prior.domains=[...new Set([...prior.domains,...n.domains])];return prior;}nodes.set(n.id,n);return n;}
  function edge(source,target,relation){if(source===target||!nodes.has(source)||!nodes.has(target))return;const key=`${source}|${target}|${relation}`;if(edgeKeys.has(key))return;edgeKeys.add(key);edges.push({source,target,relation});}
  for(const [id,bytes] of contents){
    if(!id.startsWith('knowledge/')||id.includes('/_templates/'))continue;
    const parsed=splitFrontmatter(bytes.toString()),index=id.endsWith('/INDEX.md');
    if(!index&&(validateKnowledge([{id,bytes}]).length||['retired','superseded'].includes(scalar(parsed.raw,'status'))))continue;
    const domain=index?id==='knowledge/INDEX.md'?null:id.slice(10,-9):scalar(parsed.raw,'domain');
    const freshness=index?{status:'current'}:guidanceState(parsed.raw,lock);
    const title=scalar(parsed.raw,'title')||id;
    const n={id,title,kind:index?'index':'curated-note',format:scalar(parsed.raw,'format')||'note',domain,domains:domain?[domain]:[],bytes:bytes.length,versions:list(parsed.raw,'versions'),freshness,sha256:sha(bytes),path:id,summary:parsed.body.replace(/^#+.*$/gm,'').trim().slice(0,500),applicability:scalar(parsed.raw,'applicability')};
    addNode(n);bodies.set(id,parsed.body);if(!index)entries.push(n);
  }
  for(const spec of registry.sources){const active=lock.sources[spec.id];const bytes=contents.get(`official/catalogs/${spec.id}.json`);if(!active||!bytes)continue;
    if(sha(bytes)!==active.catalogSha256)throw new Error('Committed catalog does not match its lock');
    const doc=JSON.parse(bytes);if(doc.source!==spec.id||doc.revision!==active.revision)throw new Error('Invalid committed catalog');
    const source=`source:${spec.id}`;addNode({id:source,title:spec.id,kind:'source',domains:spec.domains,bytes:0,versions:[],freshness:{status:'unknown'},sourceRevision:active.revision,catalogFetchedAt:active.fetchedAt,applicability:spec.applicability});
    for(const [items,kind] of [[doc.pages,'official-page'],[doc.skills,'skill-reference'],[doc.docs,'official-reference']])for(const item of items||[]){const url=https(item.url);if(!url)continue;
      const entry={...item,url,title:item.declaredName||item.title||item.name||url,summary:item.description||item.summary,kind,source:spec.id,domains:spec.domains,sourceRevision:active.revision,catalogFetchedAt:active.fetchedAt,sourceApplicability:spec.applicability};
      if(kind==='skill-reference')entry.applicability=item.appliesTo;
      entry.id=nodeID(entry);addNode({...entry,bytes:0,versions:entry.versions||[],freshness:{status:'unknown'}});entries.push(entry);edge(source,entry.id,'catalog membership');
    }
    for(const domain of spec.domains)edge(`knowledge/${domain}/INDEX.md`,source,'registered source');
  }
  for(const pointer of registry.pointers||[]){const url=https(pointer.url);if(!url)continue;const entry={id:`url:${sha(url)}`,kind:'official-pointer',title:pointer.domain+' official documentation',domains:[pointer.domain],url,summary:pointer.reason,bytes:0,versions:[],freshness:{status:'unknown'}};addNode(entry);entries.push(entry);edge(`knowledge/${pointer.domain}/INDEX.md`,entry.id,'official pointer');}
  for(const [id,body] of bodies){
    for(const match of body.replace(/```[\s\S]*?```/g,'').matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)){
      let href;try{href=decodeURIComponent(match[1].split('#')[0]);}catch{continue;}
      const url=https(match[1].split('#')[0]);const target=url?`url:${sha(url)}`:path.posix.normalize(path.posix.join(path.posix.dirname(id),href));
      edge(id,target,url?'cites official reference':'links to');
    }
    const node=nodes.get(id);if(node.kind==='curated-note')edge(`knowledge/${node.domain}/INDEX.md`,id,'domain membership');
  }
  cached={revision,nodes:[...nodes.values()],edges,entries,bodies,domains:config.domains};return cached;
}
export function healthOverlay(graph){
  const links=readJSON(at('.state/link-health.json'),{links:{}}).links;
  return graph.nodes.map(n=>{const state=n.url?links[sha(n.url)]:null;return {...n,...(state?{linkHealth:{state:state.state,checkedAt:state.checkedAt}}:{})};});
}
