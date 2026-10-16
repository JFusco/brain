import fs from 'node:fs';
import {createRequire} from 'node:module';
import {at,ROOT,config,readJSON,sha,safePath,noSymlinks,writeJSON,now} from './core.mjs';
const require=createRequire(import.meta.url);
const {splitFrontmatter,scalar,list}=require('../wiki/lib/frontmatter.cjs');

export function guidanceState(raw,active=readJSON(at('official/sources.lock.json'),{sources:{}})) {
  const status=scalar(raw,'status')||'current',reasons=[];
  if(status!=='current')return {status,reasons,supersededBy:scalar(raw,'superseded_by')||null};
  for(const match of scalar(raw,'provenance').matchAll(/\b([a-z0-9][a-z0-9-]+)@([a-f0-9]{12,64})(?=$|[^a-f0-9])/g)){
    const current=active.sources[match[1]];
    if(!current)reasons.push({kind:'source-unavailable',source:match[1]});
    else if(!current.revision.startsWith(match[2]))reasons.push({kind:'source-changed',source:match[1],cited:match[2],current:current.revision});
  }
  const reviewed=scalar(raw,'reviewed_at')||scalar(raw,'evidence_date');
  const explicit=scalar(raw,'review_after');
  const due=explicit?Date.parse(explicit):Date.parse(reviewed)+(config().curation?.reviewDays??30)*86400000;
  if(!Number.isFinite(due))reasons.push({kind:'review-date-unknown'});
  else if(due<=Date.now())reasons.push({kind:'review-due',dueAt:new Date(due).toISOString()});
  return {status:reasons.length?'needs-revalidation':'current',reasons,reviewedAt:reviewed||null,reviewDueAt:Number.isFinite(due)?new Date(due).toISOString():null};
}

export function publishedGuidance() {
  const records=readJSON(at('knowledge/approvals.json'),{pages:{}}),active=readJSON(at('official/sources.lock.json'),{sources:{}}),pages=[];
  for(const [relative,record]of Object.entries(records.pages)){
    safePath(relative);if(!/^knowledge\/.+\.md$/.test(relative))throw new Error('Invalid guidance publication path');
    const file=at(relative);noSymlinks(ROOT,file);const bytes=fs.readFileSync(file);
    if(sha(bytes)!==record.sha256)throw new Error('Guidance differs from its exact publication record');
    const parsed=splitFrontmatter(bytes.toString());
    pages.push({path:relative,title:scalar(parsed.raw,'title'),domain:scalar(parsed.raw,'domain'),versions:list(parsed.raw,'versions'),freshness:guidanceState(parsed.raw,active),raw:parsed.raw,body:parsed.body,sha256:record.sha256});
  }
  return pages;
}

export function staleGuidance({limit=12,write=false}={}) {
  limit=Number(limit);if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Guidance limit must be between 1 and 100');
  const pages=publishedGuidance().filter(page=>page.freshness.status==='needs-revalidation').map(({path,title,domain,sha256,freshness})=>({path,title,domain,sha256,...freshness}));
  pages.sort((a,b)=>Number(b.reasons.some(r=>r.kind==='source-changed'))-Number(a.reasons.some(r=>r.kind==='source-changed'))||(a.reviewDueAt||'').localeCompare(b.reviewDueAt||'')||a.path.localeCompare(b.path));
  const result={generatedAt:now(),total:pages.length,pages:pages.slice(0,limit),notice:'A changed source or elapsed review date requires claim verification, not automatic replacement of provenance or advice.'};
  if(write)writeJSON(at('.state/notes-needing-review.json'),result,0o600);
  return result;
}
