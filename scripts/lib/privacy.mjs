import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {at,config,mkdir,sha,writeJSON,now} from './core.mjs';

const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function terms() {const c=config();return [...new Set([...(c.clientTerms||[]),...(c.clientAliases||[])])].filter(t=>typeof t==='string'&&t.trim().length>=3).sort((a,b)=>b.length-a.length);}
export function clientHits(text) {return terms().filter(term=>new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`,'i').test(text));}
export function scrub(text) {for(const term of terms())text=text.replace(new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9])`,'gi'),'<client>');return text;}
export function policyHash() {const c=config();return sha(JSON.stringify({version:2,terms:terms(),scanner:c.toolchain.gitleaksVersion}));}
export function scanner() {
  const c=config(),binary=c.toolchain.gitleaks;
  if(!binary || !fs.existsSync(binary))throw new Error('Gitleaks is required. Run node scripts/setup.mjs.');
  if(typeof c.toolchain.gitleaksBinarySha256!=='string'||!/^[0-9a-f]{64}$/.test(c.toolchain.gitleaksBinarySha256))throw new Error('Gitleaks binary SHA-256 pin is required. Run node scripts/setup.mjs.');
  if(sha(fs.readFileSync(binary))!==c.toolchain.gitleaksBinarySha256)throw new Error('Gitleaks binary hash changed');
  const result=spawnSync(binary,['version'],{encoding:'utf8',timeout:10000});
  if(result.status!==0 || result.stdout.trim().replace(/^v/,'')!==c.toolchain.gitleaksVersion)throw new Error('Gitleaks version does not match the pinned toolchain');
  return binary;
}
export function builtinHits(text) {
  const patterns=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]{0,32768}?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],['github-token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],['aws-key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g]];
  const hits=[];for(const [rule,pattern]of patterns)for(const match of text.matchAll(pattern))hits.push({rule,index:match.index,length:match[0].length});
  for(const match of text.matchAll(/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g))if(!hits.some(h=>h.rule==='private-key'&&match.index>=h.index&&match.index<h.index+h.length))hits.push({rule:'private-key',index:match.index,length:match[0].length});
  return hits;
}
// Scanner reports and input copies stay in a private temporary directory.
export function scan(entries) {
  const binary=scanner(),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'brain-scan-'));fs.chmodSync(temporary,0o700);
  const input=path.join(temporary,'input');mkdir(input,0o700);
  try {
    const names=new Map();const findings=[];
    for(const [index,entry] of entries.entries()) {
      const name=String(index).padStart(8,'0')+'.txt';names.set(name,entry.id);
      fs.writeFileSync(path.join(input,name),entry.bytes,{mode:0o600});
      const text=entry.bytes.toString('utf8');for(const hit of builtinHits(text)){const line=text.slice(0,hit.index).split('\n').length,endLine=line+text.slice(hit.index,hit.index+hit.length).split('\n').length-1;findings.push({id:entry.id,rule:hit.rule,line,endLine,lineSha256:sha(text.split(/\r?\n/).slice(line-1,endLine).join('\n'))});}
    }
    if(!entries.length)return findings;
    const report=path.join(temporary,'report.json');
    const result=spawnSync(binary,['dir','--no-banner','--redact=100','--ignore-gitleaks-allow','--report-format','json','--report-path',report,'--exit-code','42',input],{encoding:'utf8',maxBuffer:1024*1024,timeout:300000,env:{PATH:process.env.PATH,HOME:temporary}});
    if(result.error || ![0,42].includes(result.status))throw new Error('Gitleaks scan failed; refusing unscanned content');
    const reports=fs.existsSync(report)?JSON.parse(fs.readFileSync(report,'utf8')):[];
    for(const item of reports){const id=names.get(path.basename(item.File));if(!id)throw new Error('Unexpected scanner report path');const entry=entries.find(e=>e.id===id);const lines=entry.bytes.toString('utf8').split(/\r?\n/).slice(item.StartLine-1,item.EndLine);findings.push({id,rule:item.RuleID,line:item.StartLine,endLine:item.EndLine,lineSha256:sha(lines.join('\n'))});}
    return findings;
  } finally {fs.rmSync(temporary,{recursive:true,force:true});}
}
export function assertClean(entries,{clients=true}={}) {
  const findings=scan(entries);
  if(findings.length){const id=sha(JSON.stringify(findings)).slice(0,24);writeJSON(at(`.state/scan-blocks/${id}.json`),{at:now(),findings},0o600);throw new Error(`Secret scan blocked content (${findings.length} findings; private report ${id}; values suppressed)`);}
  if(clients && entries.some(e=>clientHits(e.id+'\n'+e.bytes.toString('utf8')).length))throw new Error('Client identifier scan blocked content (values suppressed)');
}
