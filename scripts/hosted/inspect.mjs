#!/usr/bin/env node
// The investigator can inspect public vendor text but cannot publish it or access private state.
import fs from 'node:fs';
import {at,readJSON,writeJSON,sha,withLock} from '../lib/core.mjs';
import {registry} from '../lib/official.mjs';
import {download} from '../lib/network.mjs';
import {assertClean} from '../lib/privacy.mjs';
await withLock(async()=>{
  const url=new URL(process.argv[2]),hosts=new Set(['github.com','raw.githubusercontent.com']);
  for(const s of registry().sources){for(const h of s.allowedHosts||[])hosts.add(h);for(const v of [s.url,s.indexUrl,s.documentationBase].filter(Boolean))hosts.add(new URL(v).hostname);}for(const p of registry().pointers)hosts.add(new URL(p.url).hostname);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.port&&url.port!=='443'||!hosts.has(url.hostname))throw new Error('Inspection outside registered official HTTPS hosts');
  const file=at('.state/hosted/inspection-budget.json'),budget=readJSON(file,{count:0});if(budget.count>=12)throw new Error('Hosted investigator retrieval budget exhausted');budget.count++;writeJSON(file,budget,0o600);
  try{const response=await download(url.href,{hosts:[...hosts],maxBytes:4*1024*1024,headers:{accept:'text/markdown, text/plain;q=0.9, text/html;q=0.5'}});let text=response.bytes.toString();if(!text.trim()||text.includes('\0')||/just a moment|sign in to continue|cf-chl-/i.test(text.slice(0,3000)))throw new Error('Unavailable/challenged documentation');
    if(String(response.headers['content-type']||'').includes('text/html'))text=(text.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||text).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    const excerpt=text.slice(0,10000);assertClean([{id:'official-inspection',bytes:Buffer.from(excerpt)}],{clients:false});console.log(JSON.stringify({url:response.url,sha256:sha(response.bytes),excerpt,bodyStored:false}));
  }catch{console.log(JSON.stringify({url:url.href,ok:false,reason:'Official inspection failed; retain existing classification and last-good content'}));}
});
