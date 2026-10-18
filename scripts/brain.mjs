#!/usr/bin/env node
import fs from 'node:fs';
import {args,withLock} from './lib/core.mjs';
import {capture} from './lib/capture.mjs';
import * as inbox from './lib/inbox.mjs';
import * as official from './lib/official.mjs';
import * as skills from './lib/skills.mjs';
import {check} from './lib/check.mjs';
import {lookup} from './lib/lookup.mjs';
import {staleGuidance} from './lib/guidance.mjs';
import {checkLinks,linkSummary} from './lib/link-health.mjs';
import {maintenanceStatus,recordPublication} from './lib/maintenance.mjs';
import {cleanExcerptCache} from './lib/cache.mjs';

const help=`Personal brain — explicit, local knowledge and approved vendor sources

node scripts/brain.mjs lookup --query <terms> [--domain nextjs] [--limit 5] [--fetch] [--project <path> --workspace <relative-app>] [--versions next@16,react@19]
node scripts/brain.mjs capture --stdin [--domain tailwind]
node scripts/brain.mjs inbox list [--domain nextjs] [--all] [--backlog]
node scripts/brain.mjs inbox show <candidate-id>
node scripts/brain.mjs inbox rescan [<candidate-id...>]
node scripts/brain.mjs inbox resolve <candidate-id...> --as rejected|superseded
node scripts/brain.mjs inbox resolve <candidate-id...> --as accepted --pr <merged-number>
node scripts/brain.mjs curation stale [--limit 12]
node scripts/brain.mjs curation hubs
node scripts/brain.mjs links check [--source <id>] [--limit 24] [--retry-failures]
node scripts/brain.mjs links status
node scripts/brain.mjs maintenance status
node scripts/brain.mjs maintenance cleanup [--yes]
node scripts/brain.mjs maintenance publication --phase started|completed|failed [--run-id <id>] [--outcome published|unchanged] [--pr <number>] [--trigger manual|scheduled-agent]
node scripts/brain.mjs official sync [source-id...] [--seed]
node scripts/brain.mjs official check
node scripts/brain.mjs official recatalog
node scripts/brain.mjs official restore <source-id>
node scripts/brain.mjs skills suggest --project <path> [--workspace <relative-app>]
node scripts/brain.mjs check [--staged]

 Knowledge notes and registry edits publish when ordinary PRs merge.
 Nothing in this CLI commits, pushes, opens, or merges PRs.
Tests and dedicated QA are deferred for v1.
`;

try {
  const {positional,flags}=args(process.argv.slice(2)),[command,subcommand,...rest]=positional;
  const allowed={lookup:['query','domain','limit','fetch','project','workspace','versions'],capture:['stdin','domain'],inbox:['domain','all','backlog','as','pr'],curation:['limit'],links:['source','limit','retry-failures'],maintenance:['yes','phase','run-id','outcome','pr','trigger'],official:['seed'],skills:['project','workspace'],check:['staged']};
  if(!command||command==='help'||flags.help){console.log(help);process.exit(0);}
  if(!Object.hasOwn(allowed,command))throw new Error('Unknown command. Use --help.');
  for(const key of Object.keys(flags))if(!allowed[command].includes(key))throw new Error(`Unsupported option --${key} for ${command}`);
  const mutating=command==='lookup'&&flags.fetch||command==='curation'||command==='capture'||command==='links'&&subcommand==='check'||command==='maintenance'&&(subcommand==='publication'||subcommand==='cleanup'&&flags.yes)||command==='inbox'&&['resolve','rescan'].includes(subcommand)||command==='official'&&['sync','restore','recatalog'].includes(subcommand);
  async function execute() {
    if(command==='lookup')return lookup({query:flags.query,domain:flags.domain,limit:flags.limit??5,fetch:!!flags.fetch,project:flags.project,workspace:flags.workspace,versions:flags.versions});
    if(command==='capture'){if(!flags.stdin)throw new Error('Use capture --stdin');return capture(fs.readFileSync(0,'utf8'),{domain:flags.domain});}
    if(command==='inbox'){
      if(subcommand==='list')return inbox.list({domain:flags.domain,all:!!flags.all,backlog:!!flags.backlog});
      if(subcommand==='show')return inbox.show(rest[0]);
      if(subcommand==='rescan')return inbox.rescan(rest);
      if(subcommand==='resolve'){if(!rest.length)throw new Error('Candidate IDs are required');return inbox.resolve(rest,flags.as,{pr:flags.pr});}
    }
    if(command==='curation'){
      if(subcommand==='stale')return staleGuidance({limit:flags.limit??12,write:true});
      if(subcommand==='hubs')return {changed:official.generateHubs()};
    }
    if(command==='links'){
      if(subcommand==='check')return checkLinks({source:flags.source,limit:flags.limit??24,retryFailures:!!flags['retry-failures']});
      if(subcommand==='status')return linkSummary();
    }
    if(command==='maintenance'){
      if(subcommand==='status')return maintenanceStatus();
      if(subcommand==='cleanup')return cleanExcerptCache({yes:!!flags.yes});
      if(subcommand==='publication')return recordPublication({phase:flags.phase,runId:flags['run-id'],outcome:flags.outcome,pr:flags.pr,trigger:flags.trigger||'manual'});
    }
    if(command==='official'){
      if(subcommand==='sync')return official.sync({seed:!!flags.seed,ids:rest.length?rest:null});
      if(subcommand==='check'){const issues=official.checkOfficial(),gaps=official.historicalCacheGaps();return {ok:!issues.length,issues,warnings:gaps.length?[`${gaps.length} historical cached files unavailable; not verified`]:[]};}
      if(subcommand==='recatalog')return official.refreshCatalogs();
      if(subcommand==='restore')return official.restore(rest[0]);
    }
    if(command==='skills'){
      if(subcommand==='suggest')return skills.suggest(flags.project,{workspace:flags.workspace});
    }
    if(command==='check')return check({staged:!!flags.staged});
    throw new Error('Unknown subcommand. Use --help.');
  }
  const result=await (mutating?withLock(execute):execute());
  console.log(typeof result==='string'?result:JSON.stringify(result,null,2));
  if(result?.ok===false||result?.failed?.length||result?.failures?.length)process.exitCode=1;
}catch(error){console.error('brain: '+error.message);process.exitCode=1;}
