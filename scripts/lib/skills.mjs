import fs from 'node:fs';
import path from 'node:path';
import {ROOT,json,safePath,inside} from './core.mjs';
import {lock} from './official.mjs';
import {projectContext} from './project-context.mjs';

// Read-only: Brain recommends vendor skills but never writes them into projects.
function project(input,{workspace}={}) {
  if(!input)throw new Error('--project <path> is required');
  const context=projectContext(input,{workspace}),root=context.selectedRoot;
  if(context.workspaceSelectionRequired)throw new Error('Select an application with --workspace or supply its directory as --project; workspace dependencies are never merged');
  if(root===ROOT||inside(ROOT,root))throw new Error('Suggest skills for a project outside the brain');
  if(!fs.existsSync(path.join(root,'package.json')))throw new Error('Project must contain package.json');
  return {root,dependencies:context.dependencies,manifests:[{directory:root,manifest:json(path.join(root,'package.json'))}]};
}
function compatibility(p,skill) {
  if(!skill.installable)return {matches:false,reason:skill.blockedReason||'Source is reference-only'};
  const rules=skill.appliesTo||{},matches=Object.keys(p.dependencies).filter(name=>(rules.dependencies||[]).some(pattern=>pattern.endsWith('/*')?name.startsWith(pattern.slice(0,-1)):name===pattern));
  if(!matches.length)return {matches:false,reason:'No matching declared dependency'};
  if(matches.some(name=>!p.dependencies[name].version&&!/^[~^]?\d+\.\d+(?:\.\d+)?(?:[-+][\w.-]+)?$/.test(p.dependencies[name].declared)))return {matches:false,reason:'Dependency version cannot be determined safely'};
  if(skill.policy==='sitecore-bundle'){
    const version=p.dependencies['@sitecore-content-sdk/nextjs']?.version||p.dependencies['@sitecore-content-sdk/nextjs']?.declared;
    if(!/^[~^]?2\./.test(version||''))return {matches:false,reason:'Sitecore Content SDK 2.x is required by this guidance'};
    const next=p.dependencies.next?.version||p.dependencies.next?.declared;
    if(!/^[~^]?16\./.test(next||''))return {matches:false,reason:'This Sitecore bundle requires Next.js 16.x'};
    const nextConfig=['next.config.ts','next.config.mjs','next.config.js'].map(name=>path.join(p.root,name)).find(file=>fs.existsSync(file));
    if(!nextConfig||fs.statSync(nextConfig).size>65536||! /\bcacheComponents\s*:\s*true\b/.test(fs.readFileSync(nextConfig,'utf8')))return {matches:false,reason:'The required Cache Components configuration is not confirmed'};
    if(!['src/app','app'].some(name=>fs.existsSync(path.join(p.root,name))))return {matches:false,reason:'The App Router project layout is absent'};
  }
  if(skill.name==='nextjs' && (p.dependencies.next?.version||p.dependencies.next?.declared)?.match(/^[~^]?(\d+)/)?.[1]>=16)return {matches:false,reason:'Prefer installed Next.js bundled documentation; historical skill is not recommended'};
  for(const required of rules.requiredScripts||[])if(!p.manifests.some(m=>m.manifest.scripts?.[required]))return {matches:false,reason:`Required project script is absent: ${required}`};
  for(const required of rules.requiredPaths||[]){safePath(required);if(!fs.existsSync(path.join(p.root,required)))return {matches:false,reason:`Required project layout is absent: ${required}`};}
  return {matches:true,reason:matches.map(name=>`${name} ${p.dependencies[name].version||p.dependencies[name].declared} (${p.dependencies[name].confidence})`).join(', ')};
}
export function suggest(input,{workspace}={}) {
  const p=project(input,{workspace}),active=lock(),all=[];
  for(const entry of Object.values(active.sources))for(const skill of entry.skills) {
    const relevant=Object.keys(p.dependencies).some(name=>(skill.appliesTo?.dependencies||[]).some(pattern=>pattern.endsWith('/*')?name.startsWith(pattern.slice(0,-1)):name===pattern));
    if(!relevant||skill.policy==='curated'&&!skill.installable)continue;
    const match=compatibility(p,skill),present=['.agents/skills','.claude/skills'].some(dir=>fs.existsSync(path.join(p.root,dir,skill.name)));
    all.push({id:skill.id,name:skill.name,declaredName:skill.declaredName,source:entry.id,revision:entry.revision,status:present?'present in project':match.matches?'recommended':'not recommended',compatible:match.matches,reason:match.reason,preferred:skill.preferred});
  }
  for(const item of all)if(item.compatible&&!item.preferred&&all.some(other=>other.preferred&&other.compatible&&(other.name===item.name||other.declaredName===item.declaredName))){item.compatible=false;item.reason='A preferred provider supplies this skill';if(item.status==='recommended')item.status='alternative provider';}
  return all.sort((a,b)=>a.id.localeCompare(b.id));
}
