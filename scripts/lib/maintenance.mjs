import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {at,ROOT,config,readJSON,writeJSON,now,sha} from './core.mjs';
import {staleGuidance} from './guidance.mjs';
import {checkLinks,linkSummary} from './link-health.mjs';
import {cleanExcerptCache} from './cache.mjs';
import {createBackup,backupSummary,pruneBackups} from './backup.mjs';
import {api} from './network.mjs';

const overdue=(value,hours)=>!value||!Number.isFinite(Date.parse(value))||Date.now()-Date.parse(value)>hours*3600000;
export function maintenanceStatus() {
  const schedule=readJSON(at('.state/schedule.json'),{}),runs=readJSON(at('.state/official-runs.json'),{}),registry=readJSON(at('official/sources.json'),{sources:[]}),active=readJSON(at('official/sources.lock.json'),{sources:{}}),publication=readJSON(at('.state/publication.json'),{}),maintenance=readJSON(at('.state/maintenance.json'),{});
  const errors=[],warnings=[],grace=config().maintenance?.overdueHours??36,hosted=config().maintenance?.referenceBackend==='github-actions';
  const lastCollectionSuccess=schedule.lastSuccess||(!schedule.lastResult?.failures?.length?schedule.lastRun:null);
  if(overdue(lastCollectionSuccess,grace))errors.push('Collection has no recent successful run');
  if(schedule.lastResult?.failures?.length)errors.push('The latest collection run reported failures');
  if(maintenance.failures?.length)errors.push('The latest maintenance run reported failures');
  const sources=registry.sources.filter(spec=>spec.refresh!==false).map(spec=>{
    const run=runs[spec.id]||{},success=run.lastSuccess||active.sources[spec.id]?.fetchedAt||null;
    return {source:spec.id,lastAttempt:run.lastAttempt||null,lastSuccess:success,failures:run.failures||0,overdue:overdue(success,grace),nextAttemptAt:run.nextAttemptAt||null};
  });
  if(!hosted&&sources.some(source=>source.overdue||source.failures))errors.push('One or more registered sources are overdue or failing');
  if(publication.activeRun&&overdue(publication.activeRun.startedAt,2))errors.push('Publication was started but has no completion record');
  if(publication.lastOutcome==='failed')errors.push('The latest publication attempt failed');
  if(!hosted&&publication.lastSuccess&&overdue(publication.lastSuccess,grace))errors.push('Publication has no recent successful run');
  if(!publication.lastSuccess)warnings.push('Awaiting the first recorded publication run; configuration is not unattended execution proof');
  const backup=backupSummary();
  if(backup.automaticEnabled&&(!backup.lastSuccess||overdue(backup.lastSuccess,grace)||backup.lastFailure))errors.push('A current verified private-state backup is missing or failing');
  if(backup.automaticEnabled&&backup.localOnly)warnings.push(backup.cloudConfigured?'The latest encrypted backup awaits Google Drive upload/readback':'Backups are local; an off-device copy has not been verified');
  const links=linkSummary();
  if(!hosted&&(!links.lastRun||overdue(links.lastRun,grace)))warnings.push('Link sampling has no recent run');
  if(!hosted&&(links.counts.dead||links.counts['suspected-dead']))warnings.push('Link sampling found dead or potentially dead destinations');
  if(!hosted&&(links.counts.restricted||links.counts['rate-limited']))warnings.push('Some official destinations are restricted or rate-limited');
  if(!hosted&&['transient-error','unavailable','blocked-redirect','redirect-loop','invalid-redirect'].some(state=>links.counts[state]))warnings.push('Link sampling has unresolved network, availability, or redirect failures');
  const guidance=staleGuidance({limit:12});if(guidance.total)warnings.push('Curated guidance is due for source/claim revalidation');
  return {ok:!errors.length,checkedAt:now(),errors,warnings,references:{backend:hosted?'github-actions':'local',statusURL:hosted?'https://github.com/JFusco/brain/actions/workflows/brain-maintenance.yml':null,notice:hosted?'Local source/link observations are historical; inspect the hosted run and verification for current status. Local ok does not establish hosted success.':null},collection:{lastAttempt:schedule.lastAttempt||schedule.lastRun||null,lastSuccess:lastCollectionSuccess||null,failures:schedule.lastResult?.failures?.length||0},sources,publication:{lastAttempt:publication.lastAttempt||null,lastSuccess:publication.lastSuccess||null,lastOutcome:publication.lastOutcome||null,lastPr:publication.lastPr||null,activeRun:publication.activeRun||null,trigger:publication.trigger||null},maintenance:{lastAttempt:maintenance.lastAttempt||null,lastSuccess:maintenance.lastSuccess||null,failures:maintenance.failures||[]},links,guidance:{due:guidance.total},backup,notice:'Local jobs require this Mac and their host app. Agent-reported publication records distinguish manual from scheduled invocation; they are not independent scheduler attestations. Missed-run status is evaluated when checked.'};
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
      const origin=spawnSync('git',['remote','get-url','origin'],{cwd:ROOT,encoding:'utf8',timeout:10000});
      const repository=origin.stdout?.trim().match(/^(?:https:\/\/github\.com\/|git@github\.com:)([\w.-]+\/[\w.-]+?)(?:\.git)?$/)?.[1];
      if(!repository)throw new Error('Cannot establish Brain repository identity');
      const saved=await api(`repos/${repository}/pulls/${pr}`);
      if(!saved.merged_at||saved.base?.ref!=='main'||saved.base?.repo?.full_name?.toLowerCase()!==repository.toLowerCase())throw new Error('Publication PR is not merged to Brain main');
      state.lastPr=Number(pr);state.lastMergeCommit=saved.merge_commit_sha;
    }else if(pr)throw new Error('Unchanged publication cannot cite a new merged PR');
    state.lastSuccess=now();state.lastOutcome=outcome;
  }else state.lastOutcome='failed';
  state.lastCompletedAt=now();state.lastRun={...state.activeRun,outcome:state.lastOutcome,completedAt:state.lastCompletedAt};delete state.activeRun;
  writeJSON(file,state,0o600);return {runId,phase,outcome:state.lastOutcome,trigger:state.trigger};
}

export async function runMaintenance({dryRun=false,dueOnly=true}={}) {
  const automaticBackups=config().maintenance?.backupEnabled===true,disabledBackup={skipped:true,reason:'Automatic backups are disabled'};
  if(dryRun)return {dryRun:true,guidance:staleGuidance({limit:12}),cache:cleanExcerptCache(),backup:automaticBackups?await createBackup({dryRun:true}):disabledBackup,status:maintenanceStatus()};
  const state=readJSON(at('.state/maintenance.json'),{}),result={failures:[]};state.lastAttempt=now();writeJSON(at('.state/maintenance.json'),state,0o600);
  result.guidance=staleGuidance({limit:100,write:true});
  try{result.cache=cleanExcerptCache({yes:true});}catch{result.failures.push({operation:'cache',reason:'Managed excerpt cleanup failed; unverified files preserved'});}
  if(config().maintenance?.referenceBackend==='github-actions')result.links={skipped:true,reason:'Link maintenance is owned by GitHub Actions'};
  else if(!dueOnly||overdue(state.lastLinkAttempt,20)){
    try{result.links=await checkLinks();state.lastLinkAttempt=now();}catch{result.failures.push({operation:'links',reason:'Bounded link sampling failed; previous evidence retained'});}
  }
  if(automaticBackups)try{
    const backup=await createBackup({dueOnly});result.backup={skipped:!!backup.skipped,verified:!!backup.verified,files:backup.files||null};
    result.backupRetention=await pruneBackups();
  }catch{result.failures.push({operation:'backup',reason:'Encrypted backup failed; previous verified archives retained'});}
  else result.backup=disabledBackup;
  state.lastRun=now();state.failures=result.failures;if(!result.failures.length)state.lastSuccess=now();
  writeJSON(at('.state/maintenance.json'),state,0o600);
  const current=maintenanceStatus();
  const attention=sha(JSON.stringify({errors:current.errors,warnings:current.warnings,sourceFailures:current.sources.filter(s=>s.failures||s.overdue).map(s=>({source:s.source,failing:!!s.failures,overdue:s.overdue})),linkCounts:current.links.counts,guidance:current.guidance}));
  result.attentionChanged=state.attentionFingerprint!==attention;state.attentionFingerprint=attention;
  writeJSON(at('.state/maintenance.json'),state,0o600);return result;
}
