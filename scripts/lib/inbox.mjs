import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {at,ROOT,readJSON,json,writeJSON,atomic,sha,now,safePath,noSymlinks,config} from './core.mjs';
import {assertClean,policyHash} from './privacy.mjs';
import {refreshSummary} from './harvest.mjs';
import {generateHubs,updateIgnores,lock,registry,fingerprint} from './official.mjs';
import {check,validateKnowledge} from './check.mjs';

const index=()=>readJSON(at('.state/harvest.json'),{schemaVersion:1,sources:{},candidates:{}});
const proposalFile=id=>{if(!/^[0-9a-f]{24}$/.test(id))throw new Error('Invalid proposal ID');return at(`.state/proposals/${id}.json`);};
function candidate(state,id){const c=state.candidates[id];if(!c)throw new Error('Unknown candidate ID');if(c.policy!==policyHash())throw new Error('Candidate needs rescan under current privacy policy');if(sha(fs.readFileSync(at(c.file)))!==c.fileSha256)throw new Error('Candidate content changed; refusing stale approval');return c;}
export function list({domain,all=false}={}) {
  return Object.values(index().candidates).filter(c=>!c.disposition&&(!domain||c.domain===domain)&&(all||c.status==='pending')).map(c=>({id:c.id,domain:c.domain,class:c.class,status:c.status,bytes:fs.statSync(at(c.file)).size}));
}
export function show(id) {
  const c=candidate(index(),id);if(c.status==='quarantined')throw new Error('Candidate is quarantined. Inspect private provenance locally; do not load raw content into a review session.');
  const bytes=fs.readFileSync(at(c.file));if(bytes.length>config().harvest.candidateBytes+2048)throw new Error('Candidate exceeds review byte cap');return bytes.toString();
}
export function propose(input) {
  if(!Array.isArray(input.changes)||!input.changes.length||!Array.isArray(input.candidates))throw new Error('Proposal requires changes[] and candidates[]');
  const state=index(),candidates=input.candidates.map(id=>candidate(state,id));
  if(candidates.some(c=>c.status!=='pending'||c.disposition))throw new Error('Proposal requires pending, non-quarantined candidates');
  const seen=new Set();const changes=input.changes.map(change=>{
    safePath(change.path);if(seen.has(change.path))throw new Error('Duplicate proposal destination');seen.add(change.path);
    if(change.path!=='official/sources.json'&&(!/^knowledge\/.+\.md$/.test(change.path)||change.path.includes('/_templates/')))throw new Error('Proposal destination is outside curated content and source registry');
    if(typeof change.text!=='string'||!change.text.trim())throw new Error('Proposal requires full replacement text');
    noSymlinks(ROOT,at(change.path));const existing=fs.existsSync(at(change.path))?fs.readFileSync(at(change.path)):null;
    return {path:change.path,text:change.text,beforeSha256:existing?sha(existing):null};
  });
  if(Buffer.byteLength(JSON.stringify(changes))>512*1024)throw new Error('Proposal is too large for a bounded review');
  assertClean(changes.map(c=>({id:c.path,bytes:Buffer.from(c.text)})));
  const problems=validateKnowledge(changes.filter(c=>c.path.startsWith('knowledge/')).map(c=>({id:c.path,bytes:Buffer.from(c.text)})));if(problems.length)throw new Error(problems.join('; '));
  for(const change of changes.filter(c=>c.path==='official/sources.json')){const parsed=JSON.parse(change.text);if(parsed.schemaVersion!==1||!Array.isArray(parsed.sources)||!Array.isArray(parsed.pointers))throw new Error('Invalid source registry proposal');}
  const proposal={schemaVersion:1,changes,candidates:candidates.map(c=>({id:c.id,fileSha256:c.fileSha256})),policy:policyHash()};
  const digest=sha(JSON.stringify(proposal)),id=digest.slice(0,24);
  writeJSON(proposalFile(id),{...proposal,id,digest,createdAt:now()},0o600);
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'brain-proposal-'));fs.chmodSync(temporary,0o700);let diffs='';
  try{for(const change of changes){const before=path.join(temporary,'before'),after=path.join(temporary,'after');fs.writeFileSync(before,fs.existsSync(at(change.path))?fs.readFileSync(at(change.path)):'',{mode:0o600});fs.writeFileSync(after,change.text,{mode:0o600});const result=spawnSync('/usr/bin/diff',['-u','--label','a/'+change.path,'--label','b/'+change.path,before,after],{encoding:'utf8',maxBuffer:2*1024*1024});if(![0,1].includes(result.status))throw new Error('Could not render proposal diff');diffs+=`## ${change.path}\n\nPrevious SHA-256: ${change.beforeSha256||'new file'}\n\n\`\`\`diff\n${result.stdout}\`\`\`\n\n`;}}finally{fs.rmSync(temporary,{recursive:true,force:true});}
  const review=`# Proposed brain changes\n\nProposal: ${id}\n\nApproved digest: ${digest}\n\nNo content has been promoted. Approve this exact proposal before applying it.\n\n`+diffs;
  atomic(at(`.state/proposals/${id}.md`),review,0o600);return {id,digest,review:`.state/proposals/${id}.md`,changes:changes.map(c=>c.path),candidates:candidates.map(c=>c.id)};
}
export function recoverProposal() {
  const file=at('.state/proposal-transaction.json');if(!fs.existsSync(file))return;
  const transaction=json(file);
  if(transaction.phase==='committed'){fs.rmSync(file);return;}
  for(const backup of transaction.backups){safePath(backup.path);if(backup.bytes===null)fs.rmSync(at(backup.path),{force:true});else atomic(at(backup.path),Buffer.from(backup.bytes,'base64'),backup.mode);}
  fs.rmSync(file);generateHubs();updateIgnores();
}
export function apply(id,digest) {
  recoverProposal();const proposal=json(proposalFile(id));
  const payload={schemaVersion:proposal.schemaVersion,changes:proposal.changes,candidates:proposal.candidates,policy:proposal.policy};
  if(!digest||digest!==proposal.digest||sha(JSON.stringify(payload))!==digest)throw new Error('Exact approved SHA-256 is required');
  if(proposal.appliedAt)return {id,alreadyApplied:true};
  if(proposal.policy!==policyHash())throw new Error('Privacy policy changed; prepare a new proposal');
  const state=index();
  for(const reference of proposal.candidates){const c=candidate(state,reference.id);if(c.fileSha256!==reference.fileSha256||c.disposition||c.status!=='pending')throw new Error('Candidate changed after proposal');}
  for(const change of proposal.changes){noSymlinks(ROOT,at(change.path));const actual=fs.existsSync(at(change.path))?sha(fs.readFileSync(at(change.path))):null;if(actual!==change.beforeSha256)throw new Error('Destination changed after proposal; prepare a new proposal');}
  assertClean(proposal.changes.map(c=>({id:c.path,bytes:Buffer.from(c.text)})));
  const backupPaths=[...new Set([...proposal.changes.map(c=>c.path),'official/sources.lock.json','knowledge/approvals.json',`.state/proposals/${id}.json`,'.state/registry-approval.json','.state/harvest.json',...config().domains.map(d=>`knowledge/${d}/INDEX.md`)])];
  const transaction={phase:'applying',proposal:id,backups:backupPaths.map(p=>({path:p,bytes:fs.existsSync(at(p))?fs.readFileSync(at(p)).toString('base64'):null,mode:p.startsWith('.state/')?0o600:0o644}))};
  writeJSON(at('.state/proposal-transaction.json'),transaction,0o600);
  try {
    for(const change of proposal.changes)atomic(at(change.path),change.text);
    const approvals=readJSON(at('knowledge/approvals.json'),{schemaVersion:1,pages:{}});for(const change of proposal.changes)if(change.path.startsWith('knowledge/')&&!change.path.endsWith('/INDEX.md'))approvals.pages[change.path]={sha256:sha(change.text),proposal:id,digest,approvedAt:now()};writeJSON(at('knowledge/approvals.json'),approvals);
    if(proposal.changes.some(c=>c.path==='official/sources.json')){const active=lock();for(const spec of registry().sources)if(active.sources[spec.id])active.sources[spec.id].policySha256=fingerprint(spec);writeJSON(at('official/sources.lock.json'),active);writeJSON(at('.state/registry-approval.json'),{sha256:sha(fs.readFileSync(at('official/sources.json'))),proposal:id,digest,approvedAt:now()},0o600);}
    generateHubs();const result=check();if(!result.ok)throw new Error('Proposed content failed runtime checks: '+result.issues.join('; '));
    for(const reference of proposal.candidates)state.candidates[reference.id].disposition={as:'accepted',proposal:id,at:now()};
    writeJSON(at('.state/harvest.json'),state,0o600);refreshSummary(state);proposal.appliedAt=now();writeJSON(proposalFile(id),proposal,0o600);
    transaction.phase='committed';writeJSON(at('.state/proposal-transaction.json'),transaction,0o600);fs.rmSync(at('.state/proposal-transaction.json'));
    return {id,applied:true,candidates:proposal.candidates.length};
  }catch(error){recoverProposal();refreshSummary();throw error;}
}
export function resolve(ids,as) {
  if(!['rejected','superseded'].includes(as))throw new Error('Resolve requires --as rejected|superseded; acceptance happens through approved proposal application');
  const state=index();for(const id of ids){const c=candidate(state,id);if(c.disposition)throw new Error('Candidate is already resolved');}
  for(const id of ids)state.candidates[id].disposition={as,at:now()};writeJSON(at('.state/harvest.json'),state,0o600);refreshSummary(state);return {resolved:ids.length,as};
}
