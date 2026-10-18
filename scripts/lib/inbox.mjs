import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {at,ROOT,readJSON,json,writeJSON,atomic,sha,now,safePath,noSymlinks,config} from './core.mjs';
import {assertClean,policyHash} from './privacy.mjs';
import {refreshSummary} from './harvest.mjs';
import {generateHubs,updateIgnores,lock,registry,fingerprint} from './official.mjs';
import {check} from './check.mjs';
import {mergedBrainPR} from './maintenance.mjs';

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
// Proposals change only the source registry; knowledge notes publish through ordinary PRs.
export function propose(input) {
  if(!Array.isArray(input.changes)||input.changes.length!==1||input.changes[0]?.path!=='official/sources.json')throw new Error('Proposals change official/sources.json only; knowledge notes publish through ordinary PRs');
  if(input.candidates?.length||input.acceptCandidates?.length)throw new Error('Registry proposals do not cite inbox candidates');
  const [change]=input.changes;
  if(typeof change.text!=='string'||!change.text.trim())throw new Error('Proposal requires full replacement text');
  noSymlinks(ROOT,at(change.path));const existing=fs.existsSync(at(change.path))?fs.readFileSync(at(change.path)):null;
  const changes=[{path:change.path,text:change.text,beforeSha256:existing?sha(existing):null}];
  if(Buffer.byteLength(JSON.stringify(changes))>512*1024)throw new Error('Proposal is too large for a bounded review');
  assertClean(changes.map(c=>({id:c.path,bytes:Buffer.from(c.text)})));
  const parsed=JSON.parse(change.text);if(parsed.schemaVersion!==1||!Array.isArray(parsed.sources)||!Array.isArray(parsed.pointers))throw new Error('Invalid source registry proposal');
  const proposal={schemaVersion:2,changes,policy:policyHash()};
  const digest=sha(JSON.stringify(proposal)),id=digest.slice(0,24);
  writeJSON(proposalFile(id),{...proposal,id,digest,createdAt:now()},0o600);
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'brain-proposal-'));fs.chmodSync(temporary,0o700);let diffs='';
  try{for(const change of changes){const before=path.join(temporary,'before'),after=path.join(temporary,'after');fs.writeFileSync(before,fs.existsSync(at(change.path))?fs.readFileSync(at(change.path)):'',{mode:0o600});fs.writeFileSync(after,change.text,{mode:0o600});const result=spawnSync('/usr/bin/diff',['-u','--label','a/'+change.path,'--label','b/'+change.path,before,after],{encoding:'utf8',maxBuffer:2*1024*1024});if(![0,1].includes(result.status))throw new Error('Could not render proposal diff');diffs+=`## ${change.path}\n\nPrevious SHA-256: ${change.beforeSha256||'new file'}\n\n\`\`\`diff\n${result.stdout}\`\`\`\n\n`;}}finally{fs.rmSync(temporary,{recursive:true,force:true});}
  const review=`# Proposed registry change\n\nProposal: ${id}\n\nApproved digest: ${digest}\n\nNothing has been applied. Apply this exact proposal with its digest.\n\n`+diffs;
  atomic(at(`.state/proposals/${id}.md`),review,0o600);return {id,digest,review:`.state/proposals/${id}.md`,changes:changes.map(c=>c.path)};
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
  if(proposal.schemaVersion!==2||proposal.changes.some(c=>c.path!=='official/sources.json'))throw new Error('Only registry proposals can be applied; publish knowledge notes through an ordinary PR');
  const payload={schemaVersion:proposal.schemaVersion,changes:proposal.changes,policy:proposal.policy};
  if(!digest||digest!==proposal.digest||sha(JSON.stringify(payload))!==digest)throw new Error('Exact approved SHA-256 is required');
  if(proposal.appliedAt)return {id,alreadyApplied:true};
  if(proposal.policy!==policyHash())throw new Error('Privacy policy changed; prepare a new proposal');
  for(const change of proposal.changes){noSymlinks(ROOT,at(change.path));const actual=fs.existsSync(at(change.path))?sha(fs.readFileSync(at(change.path))):null;if(actual!==change.beforeSha256)throw new Error('Destination changed after proposal; prepare a new proposal');}
  assertClean(proposal.changes.map(c=>({id:c.path,bytes:Buffer.from(c.text)})));
  const backupPaths=[...new Set([...proposal.changes.map(c=>c.path),'official/sources.lock.json',`.state/proposals/${id}.json`,...config().domains.map(d=>`knowledge/${d}/INDEX.md`)])];
  const transaction={phase:'applying',proposal:id,backups:backupPaths.map(p=>({path:p,bytes:fs.existsSync(at(p))?fs.readFileSync(at(p)).toString('base64'):null,mode:p.startsWith('.state/')?0o600:0o644}))};
  writeJSON(at('.state/proposal-transaction.json'),transaction,0o600);
  try {
    for(const change of proposal.changes)atomic(at(change.path),change.text);
    const active=lock();for(const spec of registry().sources)if(active.sources[spec.id])active.sources[spec.id].policySha256=fingerprint(spec);writeJSON(at('official/sources.lock.json'),active);
    generateHubs();const result=check();if(!result.ok)throw new Error('Proposed content failed runtime checks: '+result.issues.join('; '));
    proposal.appliedAt=now();writeJSON(proposalFile(id),proposal,0o600);
    transaction.phase='committed';writeJSON(at('.state/proposal-transaction.json'),transaction,0o600);fs.rmSync(at('.state/proposal-transaction.json'));
    return {id,applied:true};
  }catch(error){recoverProposal();throw error;}
}
export async function resolve(ids,as,{pr}={}) {
  if(!['accepted','rejected','superseded'].includes(as))throw new Error('Resolve requires --as accepted|rejected|superseded');
  if(as==='accepted'&&!pr)throw new Error('Acceptance requires --pr <merged-number>');
  if(as!=='accepted'&&pr)throw new Error('Only acceptance cites a PR');
  const state=index();for(const id of ids){const c=candidate(state,id);if(c.disposition)throw new Error('Candidate is already resolved');if(as==='accepted'&&c.status!=='pending')throw new Error('Only pending candidates can be accepted');}
  // Acceptance records the merged knowledge PR that used the candidate.
  const merged=as==='accepted'?await mergedBrainPR(pr):null;
  for(const id of ids)state.candidates[id].disposition={as,at:now(),...(merged?{pr:Number(pr),mergeCommit:merged.merge_commit_sha}:{})};
  writeJSON(at('.state/harvest.json'),state,0o600);refreshSummary(state);return {resolved:ids.length,as};
}
