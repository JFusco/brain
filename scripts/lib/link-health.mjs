import fs from 'node:fs';
import {at,config,readJSON,writeJSON,now,sha} from './core.mjs';
import {lookupEntries} from './lookup.mjs';
import {registry} from './official.mjs';
import {probe} from './network.mjs';
import {publishedGuidance} from './guidance.mjs';
import {readExcerpt} from './cache.mjs';

export function linkSummary() {
  const state=readJSON(at('.state/link-health.json'),{links:{}}),counts={};
  for(const record of Object.values(state.links).filter(record=>record.active!==false))counts[record.state]=(counts[record.state]||0)+1;
  return {lastRun:state.lastRun||null,lastSuccess:state.lastSuccess||null,poolSize:state.poolSize||0,observed:Object.keys(state.links).length,counts,lastBatch:state.lastBatch||null};
}

export async function checkLinks({limit=config().maintenance?.linkLimit??24,source,retryFailures=false,skipHosts=[]}={}) {
  limit=Number(limit);if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Link limit must be between 1 and 100');
  const registered=registry(),specs=registered.sources;if(source&&!specs.some(spec=>spec.id===source)&&!(source==='website-pointers'&&registered.pointers.length))throw new Error('Unknown registered link source');
  const all=new Map(),aliases=new Map();
  for(const item of lookupEntries())if(item.url){
    const spec=specs.find(spec=>spec.id===item.source),url=new URL(item.url);
    const hosts=spec?.kind==='repository'?['github.com',...(spec.allowedHosts||[]),...(spec.documentationBase?[new URL(spec.documentationBase).hostname]:[])]:spec?.allowedHosts||[url.hostname];
    // Skipped hosts leave the pool, so their earlier records turn inactive rather than staying as warnings.
    if(url.protocol==='https:'&&!url.username&&!url.password&&(!url.port||url.port==='443')&&hosts.includes(url.hostname)&&!skipHosts.includes(url.hostname)&&!all.has(url.href))all.set(url.href,{url:url.href,source:item.source||'website-pointers',hosts,priority:0});
    if(item.fetchUrl)aliases.set(item.fetchUrl,url.href);
  }
  for(const page of publishedGuidance())if(!['superseded','retired'].includes(page.freshness.status))for(const match of page.body.matchAll(/\]\((https:\/\/[^\s)]+)\)/g)){const item=all.get(match[1]);if(item)item.priority=2;}
  const cache=readJSON(at('.state/lookup-cache.json'),{files:{}});
  for(const [name]of Object.entries(cache.files).sort((a,b)=>b[1].fetchedAt.localeCompare(a[1].fetchedAt)).slice(0,20))if(/^[a-f0-9]{64}\.json$/.test(name)&&fs.existsSync(at('.state/lookup/'+name)))try{const receipt=readExcerpt(at('.state/lookup/'+name)),item=all.get(receipt.url)||all.get(aliases.get(receipt.url));if(item)item.priority=Math.max(item.priority,1);}catch{/* unreadable cached receipt: no priority boost */}
  const state=readJSON(at('.state/link-health.json'),{schemaVersion:1,links:{}}),buckets=new Map(),cutoff=Date.now()-24*3600000;
  for(const record of Object.values(state.links))record.active=all.has(record.url);
  for(const item of all.values()){
    if(source&&item.source!==source)continue;
    const previous=state.links[sha(item.url)],failed=!!previous&&!['healthy','redirected'].includes(previous.state);
    if(retryFailures&&!failed)continue;
    if(previous){
      if(Date.parse(previous.retryAt)>Date.now())continue;
      // Healthy samples and 404/410 observations stay daily. Other failures
      // may recover after their own backoff rather than waiting a full day.
      if((!failed||[404,410].includes(previous.status))&&Date.parse(previous.checkedAt)>cutoff)continue;
    }
    item.retryDue=failed;
    if(!buckets.has(item.source))buckets.set(item.source,[]);buckets.get(item.source).push(item);
  }
  for(const bucket of buckets.values())bucket.sort((a,b)=>Number(b.retryDue)-Number(a.retryDue)||b.priority-a.priority||(state.links[sha(a.url)]?.checkedAt||'').localeCompare(state.links[sha(b.url)]?.checkedAt||'')||sha(a.url).localeCompare(sha(b.url)));
  const names=[...buckets.keys()].sort(),selected=[];let cursor=state.cursor||0;
  while(names.length&&selected.length<limit){let found=false;for(let index=0;index<names.length;index++){
    const position=(cursor+index)%names.length,bucket=buckets.get(names[position]);if(!bucket.length)continue;
    selected.push(bucket.shift());cursor=(position+1)%names.length;found=true;break;
  }if(!found)break;}
  const prior=selected.map(item=>state.links[sha(item.url)]).filter(Boolean);
  if(prior.length){const archivedAt=now();writeJSON(at(`.state/link-health-history/${archivedAt.replace(/[:.]/g,'-')}-${sha(JSON.stringify(prior)).slice(0,12)}.json`),{archivedAt,observations:prior},0o600);}
  const results=[];let next=0;
  await Promise.all(Array.from({length:Math.min(3,selected.length)},async()=>{
    while(next<selected.length){const item=selected[next++],key=sha(item.url),previous=state.links[key]||{};let observed;
      try{observed=await probe(item.url,{hosts:item.hosts});}catch{observed={state:'transient-error',status:null,finalUrl:item.url,redirects:[]};}
      const streak=observed.status===404?(previous.status===404?(previous.notFoundStreak||1)+1:1):0;
      const classification=observed.state||(observed.status===410||streak>=2?'dead':observed.status===404?'suspected-dead':[401,403,451].includes(observed.status)?'restricted':observed.status===429?'rate-limited':observed.status>=500?'transient-error':observed.status>=200&&observed.status<300?(observed.redirects.length?'redirected':'healthy'):'unavailable');
      const delay=Number(observed.retryAfter),retryMs=observed.retryAfter?(Number.isFinite(delay)?delay*1000:Date.parse(observed.retryAfter)-Date.now()):0;
      const record={url:item.url,source:item.source,active:true,checkedAt:now(),status:observed.status,...(observed.method?{method:observed.method}:{}),...(observed.headStatus?{headStatus:observed.headStatus}:{}),state:classification,finalUrl:observed.finalUrl,redirects:observed.redirects,notFoundStreak:streak,...(classification==='healthy'||classification==='redirected'?{lastHealthyAt:now()}:{lastHealthyAt:previous.lastHealthyAt||null}),retryAt:new Date(Date.now()+Math.min(24*3600000,Math.max(3600000,retryMs||0))).toISOString()};
      state.links[key]=record;results.push(record);
    }
  }));
  const problems=results.filter(record=>!['healthy','redirected'].includes(record.state));
  state.lastRun=now();state.cursor=cursor;state.poolSize=all.size;
  state.lastBatch={checked:results.length,problems:problems.length};
  if(results.length&&!problems.length)state.lastSuccess=now();
  writeJSON(at('.state/link-health.json'),state,0o600);
  return {checked:results.length,retryFailures,archivedPrevious:prior.length,poolSize:all.size,observed:Object.keys(state.links).length,completeCoverage:[...all.keys()].every(url=>state.links[sha(url)]),problems:problems.map(({source,state,status,url,finalUrl})=>({source,state,status,url,finalUrl})),results,notice:'Bounded sampling or due failure retries; healthy and 404/410 observations remain daily. Previous observations are preserved before rechecking. Access/rate limits remain separate; redirects never rewrite the registry. No page bodies are stored.'};
}
