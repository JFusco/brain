import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {at,readJSON,writeJSON,now,log} from './core.mjs';
import {harvest,COLLECTION_VERSION} from './harvest.mjs';
import {sync,generateHubs} from './official.mjs';
import {projectRoots} from './harvest.mjs';
import {suggest} from './skills.mjs';
import {policyHash} from './privacy.mjs';
import {runMaintenance} from './maintenance.mjs';

export async function scheduledRun() {
  const state=readJSON(at('.state/schedule.json')),result={harvest:null,official:null,maintenance:null,projectUpdates:0,failures:[]};
  state.lastAttempt=now();writeJSON(at('.state/schedule.json'),state,0o600);
  for(const name of ['stdout','stderr']){const file=at(`.state/launchd.${name}.log`);if(fs.existsSync(file)&&fs.statSync(file).size>1024*1024){fs.copyFileSync(file,at(`.state/logs/launchd-last.${name}.log`));fs.truncateSync(file);}}
  generateHubs();
  if(!state.harvestSuccess || state.harvestPolicy!==policyHash() || state.collectionVersion!==COLLECTION_VERSION || Date.now()-Date.parse(state.harvestSuccess)>20*3600000){try{result.harvest=await harvest();state.harvestSuccess=now();state.harvestPolicy=policyHash();state.collectionVersion=COLLECTION_VERSION;}catch(error){result.failures.push({operation:'harvest',reason:error.message});}}
  try{result.official=await sync({dueOnly:true});result.failures.push(...result.official.failed.map(f=>({operation:'official',source:f.id,reason:f.error})));}catch(error){result.failures.push({operation:'official',reason:error.message});}
  try{result.maintenance=await runMaintenance({dueOnly:true});result.failures.push(...result.maintenance.failures);}catch{result.failures.push({operation:'maintenance',reason:'Maintenance failed; inspect private status'});}
  const updates=[];
  for(const root of new Set([...projectRoots(),...readJSON(at('.state/enrolled-projects.json'),[])]))if(fs.existsSync(root+'/.agents/skills/brain.source.json')){
    try{for(const skill of suggest(root))if(['outdated','modified locally','removed upstream'].includes(skill.status))updates.push({project:root,id:skill.id,status:skill.status});}catch(error){result.failures.push({operation:'project-report',reason:'Unable to inspect an enrolled project; see private report'});updates.push({project:root,error:error.message});}
  }
  result.projectUpdates=updates.filter(u=>u.status==='outdated').length;writeJSON(at('.state/project-updates.json'),updates,0o600);
  const count=result.harvest?.newCandidates||0,changed=result.official?.changed.length||0;
  if(count||changed||result.failures.length||result.projectUpdates||result.maintenance?.attentionChanged){const message=`${count} inbox candidates · ${changed} official sources changed · ${result.projectUpdates} project updates · ${result.failures.length} failures${result.maintenance?.attentionChanged?' · maintenance status changed':''}`;const script=`display notification ${JSON.stringify(message)} with title "Personal brain"`;const notification=spawnSync('/usr/bin/osascript',['-e',script],{encoding:'utf8',timeout:10000});result.notification=notification.status===0?'sent':'unavailable';}
  state.lastRun=now();if(!result.failures.length)state.lastSuccess=state.lastRun;state.lastResult=result;writeJSON(at('.state/schedule.json'),state,0o600);log('scheduled-run',{candidates:count,changedSources:changed,failures:result.failures.length});return result;
}
