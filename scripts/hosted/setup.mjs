#!/usr/bin/env node
// Fresh-runner profile only. Never import private state from a developer machine.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {at,json,writeJSON,sha,atomic} from '../lib/core.mjs';
import {download} from '../lib/network.mjs';
import {archive} from '../lib/archive.mjs';

if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Node 24 required');
if(!['linux','darwin'].includes(process.platform)||!['x64','arm64'].includes(process.arch))throw new Error('Unsupported scanner platform');
if(fs.existsSync(at('brain.config.local.json')))throw new Error('Hosted setup refuses an existing local configuration');
// Artifact download normalizes modes; re-establish private ownership before any CLI check.
for(const relative of ['.state','.state/previous','.state/hosted']){const file=at(relative);if(!fs.existsSync(file)){if(relative==='.state')fs.mkdirSync(file,{mode:0o700});continue;}const stat=fs.lstatSync(file);if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error('Invalid hosted private directory');fs.chmodSync(file,0o700);for(const name of fs.readdirSync(file)){const entry=PathEntry(file,name);if(entry.stat.isFile())fs.chmodSync(entry.path,0o600);}}
function PathEntry(parent,name){const file=path.join(parent,name),stat=fs.lstatSync(file);if(stat.isSymbolicLink())throw new Error('Symlink in hosted private artifact');return {path:file,stat};}
const publicConfig=json(at('brain.config.json')),version=json(at('official/sources.lock.json')).toolchain.gitleaks.version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Invalid pinned scanner version');
const gh=spawnSync('which',['gh'],{encoding:'utf8'}).stdout.trim();if(!path.isAbsolute(gh))throw new Error('GitHub CLI unavailable');
const profile={official:{...publicConfig.official,allowUnavailableHistoricalCache:true},maintenance:{...publicConfig.maintenance,backupEnabled:false},clientTerms:[],clientAliases:[],harvest:{...publicConfig.harvest,projectPatterns:[]},authorities:publicConfig.authorities||[],toolchain:{node:process.execPath,gh,tar:'/usr/bin/tar'}};
writeJSON(at('brain.config.local.json'),profile,0o600);
const base=`https://github.com/gitleaks/gitleaks/releases/download/v${version}/`,name=`gitleaks_${version}_${process.platform}_${process.arch}.tar.gz`,hosts=['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'];
const [bundle,checksums]=await Promise.all([download(base+name,{hosts}),download(base+`gitleaks_${version}_checksums.txt`,{hosts,maxBytes:1024*1024})]);
const expected=checksums.bytes.toString().split('\n').map(line=>line.trim().split(/\s+/)).find(parts=>parts[1]?.replace(/^\*/,'')===name)?.[0];
if(!expected||sha(bundle.bytes)!==expected)throw new Error('Pinned scanner release checksum failed');
const files=archive(bundle.bytes,{stripRoot:false,select:name=>['gitleaks','LICENSE','LICENSE.txt'].includes(name)}),binary=at('.state/hosted-tools/gitleaks');
if(!files.has('gitleaks'))throw new Error('Scanner binary missing');atomic(binary,files.get('gitleaks'),0o700);
const result=spawnSync(binary,['version'],{encoding:'utf8'});if(result.status!==0||result.stdout.trim().replace(/^v/,'')!==version)throw new Error('Scanner version mismatch');
profile.toolchain={...profile.toolchain,gitleaks:binary,gitleaksVersion:version,gitleaksBinarySha256:sha(files.get('gitleaks'))};writeJSON(at('brain.config.local.json'),profile,0o600);
writeJSON(at('.state/hosted-toolchain.json'),{version,archiveSha256:expected,binarySha256:profile.toolchain.gitleaksBinarySha256,platform:process.platform,arch:process.arch},0o600);
console.log('Pinned checksum-verified scanner and isolated hosted profile ready; no private collection or backup configuration imported.');
