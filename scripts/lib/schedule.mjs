import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {at,config,readJSON,writeJSON,now,log} from './core.mjs';
import {sync,generateHubs} from './official.mjs';
import {runMaintenance} from './maintenance.mjs';

export async function scheduledRun() {
  const state=readJSON(at('.state/schedule.json')),result={official:null,maintenance:null,failures:[]};
  state.lastAttempt=now();writeJSON(at('.state/schedule.json'),state,0o600);
  for(const name of ['stdout','stderr']){const file=at(`.state/launchd.${name}.log`);if(fs.existsSync(file)&&fs.statSync(file).size>1024*1024){fs.copyFileSync(file,at(`.state/logs/launchd-last.${name}.log`));fs.truncateSync(file);}}
  generateHubs();
  if(config().maintenance?.referenceBackend==='github-actions')result.official={skipped:true,reason:'Official reference maintenance is owned by GitHub Actions'};
  else try{result.official=await sync({dueOnly:true});result.failures.push(...result.official.failed.map(f=>({operation:'official',source:f.id,reason:f.error})));}catch(error){result.failures.push({operation:'official',reason:error.message});}
  try{result.maintenance=await runMaintenance({dueOnly:true});result.failures.push(...result.maintenance.failures);}catch{result.failures.push({operation:'maintenance',reason:'Maintenance failed; inspect private status'});}
  const changed=result.official?.changed?.length||0;
  if(changed||result.failures.length||result.maintenance?.attentionChanged){const message=`${changed} official sources changed · ${result.failures.length} failures${result.maintenance?.attentionChanged?' · maintenance status changed':''}`;const script=`display notification ${JSON.stringify(message)} with title "Personal brain"`;const notification=spawnSync('/usr/bin/osascript',['-e',script],{encoding:'utf8',timeout:10000});result.notification=notification.status===0?'sent':'unavailable';}
  state.lastRun=now();if(!result.failures.length)state.lastSuccess=state.lastRun;state.lastResult=result;writeJSON(at('.state/schedule.json'),state,0o600);log('scheduled-run',{changedSources:changed,failures:result.failures.length});return result;
}
