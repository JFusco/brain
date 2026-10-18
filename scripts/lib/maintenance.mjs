import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {at,ROOT,readJSON,writeJSON,now} from './core.mjs';
import {staleGuidance} from './guidance.mjs';
import {linkSummary} from './link-health.mjs';
import {api} from './network.mjs';

const overdue=(value,hours)=>!value||!Number.isFinite(Date.parse(value))||Date.now()-Date.parse(value)>hours*3600000;
export function maintenanceStatus() {
  const runs=readJSON(at('.state/official-runs.json'),{}),registry=readJSON(at('official/sources.json'),{sources:[]}),active=readJSON(at('official/sources.lock.json'),{sources:{}}),publication=readJSON(at('.state/publication.json'),{});
  const errors=[],warnings=[];
  const sources=registry.sources.map(spec=>{const run=runs[spec.id]||{},entry=active.sources[spec.id];return {source:spec.id,revision:entry?.revision||null,fetchedAt:entry?.fetchedAt||null,catalogAgeDays:Number.isFinite(Date.parse(entry?.fetchedAt))?Math.floor((Date.now()-Date.parse(entry.fetchedAt))/86400000):null,lastLocalAttempt:run.lastAttempt||null,lastLocalSuccess:run.lastSuccess||null,failures:run.failures||0};});
  if(publication.activeRun&&overdue(publication.activeRun.startedAt,2))errors.push('Publication was started but has no completion record');
  if(publication.lastOutcome==='failed')errors.push('The latest publication attempt failed');
  if(!publication.lastSuccess)warnings.push('Awaiting the first recorded publication run; configuration is not unattended execution proof');
  const guidance=staleGuidance({limit:12});if(guidance.total)warnings.push('Curated guidance is due for source/claim revalidation');
  return {ok:!errors.length,checkedAt:now(),errors,warnings,sources,publication:{lastAttempt:publication.lastAttempt||null,lastSuccess:publication.lastSuccess||null,lastOutcome:publication.lastOutcome||null,lastPr:publication.lastPr||null,activeRun:publication.activeRun||null,trigger:publication.trigger||null},links:linkSummary(),guidance:{due:guidance.total},notice:'Agent-reported publication records distinguish manual from scheduled invocation; they are not independent scheduler attestations. Link counts are local samples from this machine.'};
}

export async function mergedBrainPR(pr) {
  if(!/^[1-9]\d*$/.test(String(pr||'')))throw new Error('A merged PR number is required');
  const origin=spawnSync('git',['remote','get-url','origin'],{cwd:ROOT,encoding:'utf8',timeout:10000});
  const repository=origin.stdout?.trim().match(/^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1];
  if(!repository)throw new Error('Cannot establish Brain repository identity');
  const saved=await api(`repos/${repository}/pulls/${pr}`);
  if(!saved.merged_at||saved.base?.ref!=='main'||saved.base?.repo?.full_name?.toLowerCase()!==repository.toLowerCase())throw new Error('PR is not merged to Brain main');
  return saved;
}

export async function recordPublication({phase,runId,outcome,pr,trigger='manual'}={}) {
  const file=at('.state/publication.json'),state=readJSON(file,{});
  if(!['manual','scheduled-agent'].includes(trigger))throw new Error('Publication trigger must be manual or scheduled-agent');
  if(phase==='started'){
    if(state.activeRun&&!overdue(state.activeRun.startedAt,2))throw new Error('A publication run is already active; reconcile it before starting another');
    if(state.activeRun)state.lastAbandonedRun=state.activeRun;
    state.activeRun={id:crypto.randomUUID(),startedAt:now(),trigger};state.lastAttempt=now();state.trigger=trigger;
    writeJSON(file,state,0o600);return {runId:state.activeRun.id,started:true,trigger};
  }
  if(!['completed','failed'].includes(phase)||!runId||state.activeRun?.id!==runId)throw new Error('Completion requires the active publication run ID');
  if(phase==='completed'){
    if(!['published','unchanged'].includes(outcome))throw new Error('Completion outcome must be published or unchanged');
    if(outcome==='published'){
      if(!/^[1-9]\d*$/.test(String(pr||'')))throw new Error('Published completion requires --pr');
      const saved=await mergedBrainPR(pr);
      state.lastPr=Number(pr);state.lastMergeCommit=saved.merge_commit_sha;
    }else if(pr)throw new Error('Unchanged publication cannot cite a new merged PR');
    state.lastSuccess=now();state.lastOutcome=outcome;
  }else state.lastOutcome='failed';
  state.lastCompletedAt=now();state.lastRun={...state.activeRun,outcome:state.lastOutcome,completedAt:state.lastCompletedAt};delete state.activeRun;
  writeJSON(file,state,0o600);return {runId,phase,outcome:state.lastOutcome,trigger:state.trigger};
}
