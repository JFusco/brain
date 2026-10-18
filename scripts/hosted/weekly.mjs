#!/usr/bin/env node
// Weekly reference health: refresh catalogs in the runner (never committed), sample links, run check and keep one issue.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {at,ROOT,config,json,readJSON,writeJSON,atomic,sha,withLock} from '../lib/core.mjs';
import {registry,sync} from '../lib/official.mjs';
import {checkLinks} from '../lib/link-health.mjs';
import {staleGuidance} from '../lib/guidance.mjs';
import {check} from '../lib/check.mjs';
import {assertClean} from '../lib/privacy.mjs';

const repository='JFusco/brain',maxBytes=32*1024*1024,runId=process.env.GITHUB_RUN_ID,event=process.env.GITHUB_EVENT_NAME;
if(process.env.GITHUB_REPOSITORY!==repository||process.env.GITHUB_REF!=='refs/heads/main'||!/^\d+$/.test(runId||'')||!['schedule','workflow_dispatch'].includes(event))throw new Error('Weekly reference health requires a trusted Brain default-branch scheduled/manual run');
const runURL=`https://github.com/${repository}/actions/runs/${runId}`,marker='<!-- brain-weekly-reference-health -->',title='[Task] Brain weekly reference health';
function gh(...args){const result=spawnSync(config().toolchain.gh,args,{cwd:ROOT,encoding:'utf8',maxBuffer:maxBytes,timeout:120000});if(result.status!==0)throw new Error('GitHub CLI operation failed; inspect the weekly step');return result.stdout.trim();}
const ghJSON=(...args)=>JSON.parse(gh(...args));
const STATES=['healthy','redirected','dead','suspected-dead','restricted','rate-limited','transient-error','unavailable','blocked-redirect','redirect-loop','invalid-redirect'];
function officialHosts(){const hosts=new Set(['github.com','raw.githubusercontent.com']),add=value=>{try{hosts.add(new URL(value).hostname);}catch{}};for(const s of registry().sources){for(const h of s.allowedHosts||[])hosts.add(h);add(s.documentationBase);add(s.url);add(s.indexUrl);}for(const p of registry().pointers)add(p.url);return hosts;}
function bounded(file){const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>maxBytes)throw new Error('Invalid previous weekly artifact');assertClean([{id:'previous-weekly-state',bytes:fs.readFileSync(file)}],{clients:false});return json(file);}
// The previous run's observations carry the two-strike 404 rule, backoff and rotation between weekly runs.
function restorePrevious(){
  const links=at('.state/previous/link-health.json'),runs=at('.state/previous/official-runs.json');
  if(fs.existsSync(links)){
    const saved=bounded(links),hosts=officialHosts();if(!saved.links||typeof saved.links!=='object'||Object.keys(saved.links).length>10000)throw new Error('Invalid previous link state');
    for(const [key,record] of Object.entries(saved.links)){let keep=false;try{const url=new URL(record.url),final=new URL(record.finalUrl||record.url);keep=sha(record.url)===key&&STATES.includes(record.state)&&url.protocol==='https:'&&!url.username&&!url.password&&hosts.has(url.hostname)&&final.protocol==='https:'&&!final.username&&!final.password;}catch{}if(!keep)delete saved.links[key];}
    writeJSON(at('.state/link-health.json'),saved,0o600);
  }
  if(fs.existsSync(runs)){const saved=bounded(runs),kept={};for(const spec of registry().sources){const run=saved[spec.id];if(!run||typeof run!=='object')continue;kept[spec.id]={};for(const key of ['lastAttempt','lastSuccess','failures','nextAttemptAt','error'])if(Object.hasOwn(run,key))kept[spec.id][key]=run[key];}writeJSON(at('.state/official-runs.json'),kept,0o600);}
}
const short=value=>value?`\`${value.slice(0,12)}\``:'none';
const driftLine=c=>`\`${c.id}\`: ${c.to===null?'source no longer registered':c.from===null?`new catalog at ${short(c.to)}`:c.from===c.to?'catalog metadata changed':`${short(c.from)} → ${short(c.to)}`}`;
const localLine=ids=>ids.length?`${ids.map(id=>`\`${id}\``).join(', ')} ${ids.length===1?'is':'are'} refreshed only by the local weekly sync, because ${ids.length===1?'its host refuses':'their hosts refuse'} GitHub-hosted runners.`:'';
function body({notes,failures,warnings,issues},{fingerprint,links,runs,drift,local}){
  const list=(items,line)=>items.length?items.map(line).join('\n'):'None.';
  const shown=warnings.slice(0,50);
  return `${marker}
## Summary

${notes.length} notes citing changed sources, ${failures.length} source refresh failures, ${warnings.length} link warnings and ${issues.length} check failures. ${drift.length} catalog${drift.length===1?'':'s'} also drifted upstream, which is routine and never opens this issue. ${local.length?localLine(local)+' ':''}Last updated by [run ${runId}](${runURL}).

## Notes citing changed sources

${list(notes,n=>`- [${n.path}](https://github.com/${repository}/blob/main/${n.path}) cites \`${n.source}@${n.cited.slice(0,12)}\`; the source is now ${short(n.current)}.`)}

## Source refresh failures

${list(failures,f=>`- \`${f.source}\`: ${f.reason} (last success ${runs[f.source]?.lastSuccess?.slice(0,10)||'not recorded'}).`)}

## Link warnings

Checked ${links.checked} links from a pool of ${links.poolSize}; this is a bounded sample, not a full audit.

${list(shown,w=>`- \`${w.source}\`: ${w.state} (${w.status?`HTTP ${w.status}`:'no HTTP response'}) — ${w.url}`)}${warnings.length>shown.length?`\n- …and ${warnings.length-shown.length} more.`:''}

## Check failures

${list(issues,i=>`- ${i}`)}

## Routine catalog drift

Informational, as of this update; drift alone never opens this issue. The weekly catalog-refresh PR picks it up.

${list(drift,c=>`- ${driftLine(c)}`)}

## Expected Outcome

- **Notes citing changed sources:** re-verify each claim against the current official page and update it through a knowledge PR. Never change only a hash or date.
- **Failures and link warnings:** fix registry routing through an ordinary issue-linked PR, which stops for review. A redirect or changed hash is not evidence that a claim is correct.

## Additional Notes

Fingerprint: ${fingerprint}. The issue is rewritten only when its findings change, and closed when a run finds none.
`;
}
function deliver(findings,context){
  // Only findings that need a person open or rewrite the issue; routine catalog drift does not.
  const open=ghJSON('issue','list','--repo',repository,'--state','open','--label','documentation','--search',`"${title}" in:title`,'--json','number,body,title').filter(i=>i.body.includes(marker));
  if(open.length>1)throw new Error('Ambiguous weekly reference health issues');
  const [current]=open,empty=Object.values(findings).every(list=>!list.length);
  if(empty){
    if(!current)return {outcome:'no findings',issue:null};
    gh('issue','close',String(current.number),'--repo',repository,'--reason','completed','--comment',`No findings in [run ${runId}](${runURL}).${context.drift.length?` Routine catalog drift: ${context.drift.map(c=>c.id).join(', ')}.`:''}`);
    if(ghJSON('issue','view',String(current.number),'--repo',repository,'--json','state').state!=='CLOSED')throw new Error('Weekly issue did not close');
    return {outcome:'closed',issue:current.number};
  }
  if(current?.body.includes(`Fingerprint: ${context.fingerprint}.`))return {outcome:'unchanged',issue:current.number};
  const text=body(findings,context),file=at('.state/weekly-issue.md');atomic(file,text,0o600);
  const number=current?current.number:Number(gh('issue','create','--repo',repository,'--title',title,'--label','documentation','--body-file',file).split('/').pop());
  if(current)gh('issue','edit',String(number),'--repo',repository,'--body-file',file);
  const saved=ghJSON('issue','view',String(number),'--repo',repository,'--json','body,title,state,labels');
  if(saved.body.trim()!==text.trim()||saved.title!==title||saved.state!=='OPEN'||!saved.labels.some(label=>label.name==='documentation'))throw new Error('Saved weekly issue does not match');
  return {outcome:current?'updated':'opened',issue:number};
}
const report=await withLock(async()=>{
  restorePrevious();
  const refresh=await sync({hosted:true}),skipHosts=registry().runnerBlockedHosts||[];
  const notes=staleGuidance({limit:100}).pages.flatMap(page=>page.reasons.filter(r=>r.kind==='source-changed').map(r=>({path:page.path,source:r.source,cited:r.cited,current:r.current})));
  const links=await checkLinks({limit:100,skipHosts}),pointers=await checkLinks({source:'website-pointers',limit:24,skipHosts});
  const state=readJSON(at('.state/link-health.json'),{links:{}});
  const warnings=Object.values(state.links).filter(r=>r.active!==false&&!['healthy','redirected'].includes(r.state)).map(r=>({source:r.source,url:r.url,state:r.state,status:r.status??null})).sort((a,b)=>a.source.localeCompare(b.source)||a.url.localeCompare(b.url));
  let issues;try{issues=check().issues;}catch(error){issues=[error.message];}
  const findings={notes,failures:refresh.failed.map(f=>({source:f.id,reason:f.error})),warnings,issues};
  const fingerprint=sha(JSON.stringify(findings));
  const delivery=deliver(findings,{fingerprint,drift:refresh.changed,local:refresh.skipped,links:{checked:links.checked+pointers.checked,poolSize:links.poolSize},runs:readJSON(at('.state/official-runs.json'),{})});
  return {refresh:{changed:refresh.changed.length,unchanged:refresh.unchanged.length,failed:refresh.failed.length,skipped:refresh.skipped},drift:refresh.changed.map(driftLine),notes:notes.length,links:{checked:links.checked+pointers.checked,poolSize:links.poolSize,warnings:warnings.length},checkIssues:issues.length,...delivery};
});
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## Brain weekly reference health\n\n- Catalogs: ${report.refresh.changed} changed, ${report.refresh.unchanged} unchanged, ${report.refresh.failed} failed (working tree only; nothing committed).${report.drift.map(line=>`\n  - ${line}`).join('')}${report.refresh.skipped.length?`\n- Not refreshed here: ${localLine(report.refresh.skipped)}`:''}\n- Notes citing changed sources: ${report.notes}.\n- Links: ${report.links.checked} checked of ${report.links.poolSize}; ${report.links.warnings} active warnings.\n- Check failures: ${report.checkIssues}.\n- Issue: ${report.outcome}${report.issue?` (#${report.issue})`:''}.\n`);
console.log(JSON.stringify(report,null,2));
