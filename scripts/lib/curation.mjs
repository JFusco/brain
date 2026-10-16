import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {at,ROOT,json,readJSON,writeJSON,atomic,sha,now} from './core.mjs';
import {safePath,noSymlinks} from './core.mjs';
import {policyHash,assertClean} from './privacy.mjs';
import {list,show} from './inbox.mjs';
import {refreshSummary} from './harvest.mjs';
import {api} from './network.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {scalar,splitFrontmatter}=require('../wiki/lib/frontmatter.cjs');

function git(args,cwd=ROOT,{bytes=false}={}) {
  const result=spawnSync('git',args,{cwd,encoding:bytes?null:'utf8',maxBuffer:8*1024*1024,timeout:30000});
  if(result.status!==0)throw new Error('Curation Git operation failed: '+args[0]);
  return bytes?result.stdout:result.stdout.trim();
}
function proposal(id) {
  if(!/^[a-f0-9]{24}$/.test(id||''))throw new Error('Invalid proposal ID');
  const value=json(at(`.state/proposals/${id}.json`));
  const payload={schemaVersion:value.schemaVersion,changes:value.changes,candidates:value.candidates,policy:value.policy};
  if(Object.hasOwn(value,'acceptCandidates'))payload.acceptCandidates=value.acceptCandidates;
  if(sha(JSON.stringify(payload))!==value.digest)throw new Error('Proposal bytes changed');
  if(value.policy!==policyHash())throw new Error('Proposal requires rescan under the current privacy policy');
  if(value.changes.some(change=>!/^knowledge\/.+\.md$/.test(change.path)))throw new Error('Curation export supports knowledge pages only');
  const pending=new Set(list().map(candidate=>candidate.id));
  for(const reference of value.candidates)if(!pending.has(reference.id)||sha(show(reference.id))!==reference.fileSha256)throw new Error('Cited candidate changed or is no longer pending');
  assertClean(value.changes.map(change=>({id:change.path,bytes:Buffer.from(change.text)})));
  return value;
}
export function exportProposal(id,directory) {
  if(!directory)throw new Error('--worktree is required');
  const target=fs.realpathSync(directory);
  const common=root=>fs.realpathSync(path.resolve(root,git(['rev-parse','--git-common-dir'],root)));
  if(target===ROOT||common(target)!==common(ROOT))throw new Error('Use a separate worktree of this Brain repository');
  if(!/^codex\/\d+-[a-z0-9-]+$/.test(git(['branch','--show-current'],target)))throw new Error('Use an issue-linked codex branch');
  if(git(['status','--porcelain'],target))throw new Error('Curation export requires a clean worktree');
  const value=proposal(id),writes=new Map();
  for(const change of value.changes){safePath(change.path);const file=path.join(target,change.path);noSymlinks(target,file);const actual=fs.existsSync(file)?sha(fs.readFileSync(file)):null;if(actual!==change.beforeSha256)throw new Error('Proposal destination changed; prepare a fresh proposal');writes.set(change.path,change.text);}
  const approvalsPath=path.join(target,'knowledge/approvals.json');noSymlinks(target,approvalsPath);
  const approvals=readJSON(approvalsPath,{schemaVersion:1,pages:{}});
  for(const change of value.changes)if(!change.path.endsWith('/INDEX.md'))approvals.pages[change.path]={sha256:sha(change.text),proposal:id,digest:value.digest,method:'automatic-curation-pr',preparedAt:now()};
  const config=json(path.join(target,'brain.config.json'));
  for(const domain of config.domains){const relative=`knowledge/${domain}/INDEX.md`,file=path.join(target,relative);noSymlinks(target,file);let text=writes.get(relative)??fs.readFileSync(file,'utf8');const pages=[];for(const [name,approval]of Object.entries(approvals.pages)){if(!name.startsWith(`knowledge/${domain}/`)||name.endsWith('/INDEX.md'))continue;safePath(name);const destination=path.join(target,name);noSymlinks(target,destination);const content=writes.get(name)??(fs.existsSync(destination)?fs.readFileSync(destination,'utf8'):null);if(content===null||sha(content)!==approval.sha256)continue;const title=scalar(splitFrontmatter(content).raw,'title');pages.push(`- [${title.replace(/[\[\]]/g,'')}](${path.relative(path.dirname(file),destination).split(path.sep).join('/')})`);}text=text.replace(/<!-- brain:curated:start -->[\s\S]*?<!-- brain:curated:end -->/,`<!-- brain:curated:start -->\n${pages.length?pages.sort().join('\n'):'No approved learnings yet.'}\n<!-- brain:curated:end -->`);if(text!==fs.readFileSync(file,'utf8'))writes.set(relative,text);}
  writes.set('knowledge/approvals.json',JSON.stringify(approvals,null,2)+'\n');
  assertClean([...writes].map(([name,text])=>({id:name,bytes:Buffer.from(text)})));
  // All destinations and content are checked before writing. A failed export stays
  // isolated and dirty for inspection; it never publishes or resolves candidates.
  for(const [relative,text]of writes)atomic(path.join(target,relative),text);
  const receipt={proposal:id,digest:value.digest,files:[...writes].map(([name,text])=>({path:name,sha256:sha(text)})),preparedAt:now()};
  writeJSON(at(`.state/curation/${id}.json`),receipt,0o600);
  return {proposal:id,files:receipt.files.map(file=>file.path),index:git(['rev-parse','--path-format=absolute','--git-path','index'],target),published:false};
}
export async function recordMerge(id,number) {
  if(!/^[1-9]\d*$/.test(String(number||'')))throw new Error('--pr <number> is required');
  const recordPath=at(`.state/curation/${id}.json`);
  if(!/^[a-f0-9]{24}$/.test(id||''))throw new Error('Invalid proposal ID');
  const receipt=json(recordPath);if(receipt.mergedAt)return {proposal:id,alreadyRecorded:true};
  const value=proposal(id),origin=git(['remote','get-url','origin']);
  const repository=origin.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1];
  if(!repository)throw new Error('Brain origin must identify one GitHub repository');
  const pr=await api(`repos/${repository}/pulls/${number}`);
  if(!pr.merged_at)return {proposal:id,pr:Number(number),merged:false};
  if(pr.base?.ref!=='main'||pr.base?.repo?.full_name?.toLowerCase()!==repository.toLowerCase()||!/^codex\/\d+-/.test(pr.head?.ref||'')||!pr.body?.includes(value.digest))throw new Error('Merged PR does not identify this Brain proposal');
  const commit=pr.merge_commit_sha;if(!/^[a-f0-9]{40}$/.test(commit||''))throw new Error('Merged PR has no immutable merge commit');
  // Fetching and updating the checkout are ordinary Git delivery operations;
  // the caller fetches main first. Never accept a PR solely from its status.
  const ancestor=spawnSync('git',['merge-base','--is-ancestor',commit,'origin/main'],{cwd:ROOT,timeout:30000});
  if(ancestor.status!==0)throw new Error('Fetch origin/main before recording this merge');
  if(receipt.digest!==value.digest)throw new Error('Export receipt does not match proposal');
  for(const file of receipt.files){safePath(file.path);if(sha(git(['show',`${commit}:${file.path}`],ROOT,{bytes:true}))!==file.sha256)throw new Error('Merged content differs from the prepared curation; candidates remain pending');}
  const state=readJSON(at('.state/harvest.json'));
  const accepted=value.acceptCandidates??value.candidates.map(candidate=>candidate.id);
  for(const candidateId of accepted)state.candidates[candidateId].disposition={as:'accepted',proposal:id,pr:Number(number),mergeCommit:commit,at:now()};
  writeJSON(at('.state/harvest.json'),state,0o600);refreshSummary(state);
  writeJSON(recordPath,{...receipt,pr:Number(number),url:pr.html_url,mergedAt:pr.merged_at,mergeCommit:commit,recordedAt:now()},0o600);
  return {proposal:id,pr:Number(number),merged:true,accepted:accepted.length};
}
