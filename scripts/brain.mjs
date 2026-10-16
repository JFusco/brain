#!/usr/bin/env node
import fs from 'node:fs';
import {args,at,json,withLock,log} from './lib/core.mjs';
import {harvest,capture} from './lib/harvest.mjs';
import * as inbox from './lib/inbox.mjs';
import * as official from './lib/official.mjs';
import * as skills from './lib/skills.mjs';
import {check} from './lib/check.mjs';
import {scheduledRun} from './lib/schedule.mjs';
import {exportProposal,recordMerge} from './lib/curation.mjs';
import {lookup} from './lib/lookup.mjs';
import {staleGuidance} from './lib/guidance.mjs';
import {checkLinks,linkSummary} from './lib/link-health.mjs';
import {maintenanceStatus,runMaintenance,recordPublication} from './lib/maintenance.mjs';
import {cleanExcerptCache} from './lib/cache.mjs';
import {createBackup,inspectBackup,backupSummary,configureCloudBackup,pendingCloudBackups,recordCloudBackup} from './lib/backup.mjs';

const help=`Personal brain — explicit, local knowledge and approved vendor sources

node scripts/brain.mjs harvest [--dry-run]
node scripts/brain.mjs lookup --query <terms> [--domain nextjs] [--limit 5] [--fetch] [--project <path> --workspace <relative-app>] [--versions next@16,react@19]
node scripts/brain.mjs capture --stdin
node scripts/brain.mjs inbox list [--domain nextjs] [--all]
node scripts/brain.mjs inbox show <candidate-id>
node scripts/brain.mjs inbox propose --file <proposal-input.json>
node scripts/brain.mjs inbox apply <proposal-id> --approved-sha256 <digest>
node scripts/brain.mjs inbox resolve <candidate-id...> --as rejected|superseded
node scripts/brain.mjs curation export <proposal-id> --worktree <path>
node scripts/brain.mjs curation record-merge <proposal-id> --pr <number>
node scripts/brain.mjs curation stale [--limit 12]
node scripts/brain.mjs links check [--source <id>] [--limit 24]
node scripts/brain.mjs links status
node scripts/brain.mjs maintenance status
node scripts/brain.mjs maintenance run [--dry-run]
node scripts/brain.mjs maintenance cleanup [--yes]
node scripts/brain.mjs maintenance publication --phase started|completed|failed [--run-id <id>] [--outcome published|unchanged] [--pr <number>] [--trigger manual|scheduled-agent]
node scripts/brain.mjs backup status
node scripts/brain.mjs backup create [--directory <path>] [--dry-run]
node scripts/brain.mjs backup verify --file <archive> [--key-file <key>]
node scripts/brain.mjs backup restore --file <archive> --to <empty-directory> [--key-file <key>] [--yes]
node scripts/brain.mjs backup configure-cloud --folder-id <id> --folder-url <verified-url>
node scripts/brain.mjs backup pending [--limit 1]
node scripts/brain.mjs backup record-cloud --file <archive> --receipt <private-provider-json>
node scripts/brain.mjs official sync [source-id...] [--seed]
node scripts/brain.mjs official check
node scripts/brain.mjs official recatalog
node scripts/brain.mjs official rollback <source-id>
node scripts/brain.mjs official restore <source-id>
node scripts/brain.mjs skills suggest --project <path> [--workspace <relative-app>]
node scripts/brain.mjs skills install|update|remove <source-id/skill...> --project <path> [--yes] [--dry-run] [--copy]
node scripts/brain.mjs skills install|update --recommended --project <path> [--yes] [--dry-run]
node scripts/brain.mjs skills recover --project <path> [--yes] [--dry-run]
node scripts/brain.mjs check [--staged]
node scripts/brain.mjs scheduled-run

 Proposals bind exact text and evidence. Curation publishes through documented PRs.
 Nothing in this CLI commits, pushes, opens, or merges PRs.
Tests and dedicated QA are deferred for v1.
`;

try {
  const {positional,flags}=args(process.argv.slice(2)),[command,subcommand,...rest]=positional;
  const allowed={lookup:['query','domain','limit','fetch','project','workspace','versions'],harvest:['dry-run'],capture:['stdin'],inbox:['domain','all','file','approved-sha256','as'],curation:['worktree','pr','limit'],links:['source','limit'],maintenance:['dry-run','yes','phase','run-id','outcome','pr','trigger'],backup:['directory','file','key-file','to','yes','dry-run','folder-id','folder-url','limit','receipt'],official:['seed'],skills:['project','workspace','recommended','yes','dry-run','copy'],check:['staged'],'scheduled-run':[]};
  if(!command||command==='help'||flags.help){console.log(help);process.exit(0);}
  if(!Object.hasOwn(allowed,command))throw new Error('Unknown command. Use --help.');
  for(const key of Object.keys(flags))if(!allowed[command].includes(key))throw new Error(`Unsupported option --${key} for ${command}`);
  const mutating=command==='lookup'&&flags.fetch||command==='curation'||command==='scheduled-run'||command==='capture'||command==='harvest'&&!flags['dry-run']||command==='links'&&subcommand==='check'||command==='maintenance'&&(subcommand==='publication'||subcommand==='run'&&!flags['dry-run']||subcommand==='cleanup'&&flags.yes)||command==='backup'&&(subcommand==='create'&&!flags['dry-run']||subcommand==='restore'&&flags.yes||['configure-cloud','record-cloud'].includes(subcommand))||command==='inbox'&&['propose','apply','resolve'].includes(subcommand)||command==='official'&&['sync','rollback','restore','recatalog'].includes(subcommand)||command==='skills'&&subcommand!=='suggest'&&flags.yes&&!flags['dry-run'];
  async function execute() {
    if(mutating)inbox.recoverProposal();
    if(command==='lookup')return lookup({query:flags.query,domain:flags.domain,limit:flags.limit??5,fetch:!!flags.fetch,project:flags.project,workspace:flags.workspace,versions:flags.versions});
    if(command==='harvest')return harvest({dryRun:!!flags['dry-run']});
    if(command==='capture'){if(!flags.stdin)throw new Error('Use capture --stdin');return capture(fs.readFileSync(0,'utf8'));}
    if(command==='inbox'){
      if(subcommand==='list')return inbox.list({domain:flags.domain,all:!!flags.all});
      if(subcommand==='show')return inbox.show(rest[0]);
      if(subcommand==='propose'){if(!flags.file)throw new Error('--file is required');return inbox.propose(json(flags.file));}
      if(subcommand==='apply')return inbox.apply(rest[0],flags['approved-sha256']);
      if(subcommand==='resolve'){if(!rest.length)throw new Error('Candidate IDs are required');return inbox.resolve(rest,flags.as);}
    }
    if(command==='curation'){
      if(subcommand==='export')return exportProposal(rest[0],flags.worktree);
      if(subcommand==='record-merge')return recordMerge(rest[0],flags.pr);
      if(subcommand==='stale')return staleGuidance({limit:flags.limit??12,write:true});
    }
    if(command==='links'){
      if(subcommand==='check')return checkLinks({source:flags.source,limit:flags.limit??24});
      if(subcommand==='status')return linkSummary();
    }
    if(command==='maintenance'){
      if(subcommand==='status')return maintenanceStatus();
      if(subcommand==='run')return runMaintenance({dryRun:!!flags['dry-run']});
      if(subcommand==='cleanup')return cleanExcerptCache({yes:!!flags.yes});
      if(subcommand==='publication')return recordPublication({phase:flags.phase,runId:flags['run-id'],outcome:flags.outcome,pr:flags.pr,trigger:flags.trigger||'manual'});
    }
    if(command==='backup'){
      if(subcommand==='status')return backupSummary();
      if(subcommand==='create')return createBackup({directory:flags.directory,dryRun:!!flags['dry-run']});
      if(subcommand==='verify')return inspectBackup(flags.file,{keyFile:flags['key-file']});
      if(subcommand==='restore'){if(!flags.to)throw new Error('--to is required');return inspectBackup(flags.file,{keyFile:flags['key-file'],restoreTo:flags.to,yes:!!flags.yes});}
      if(subcommand==='configure-cloud')return configureCloudBackup(flags['folder-id'],flags['folder-url']);
      if(subcommand==='pending')return pendingCloudBackups({limit:flags.limit??1});
      if(subcommand==='record-cloud')return recordCloudBackup(flags.file,flags.receipt);
    }
    if(command==='official'){
      if(subcommand==='sync')return official.sync({seed:!!flags.seed,ids:rest.length?rest:null});
      if(subcommand==='check'){const issues=official.checkOfficial();return {ok:!issues.length,issues};}
      if(subcommand==='recatalog')return official.refreshCatalogs();
      if(subcommand==='rollback')return official.rollback(rest[0]);
      if(subcommand==='restore')return official.restore(rest[0]);
    }
    if(command==='skills'){
      if(subcommand==='suggest')return skills.suggest(flags.project,{workspace:flags.workspace});
      if(subcommand==='recover')return skills.recover(flags.project,{yes:!!flags.yes,dryRun:!!flags['dry-run'],workspace:flags.workspace});
      if(['install','update','remove'].includes(subcommand))return skills.mutate(subcommand,flags.project,rest,{recommended:!!flags.recommended,yes:!!flags.yes,dryRun:!!flags['dry-run'],copy:flags.copy?true:null,workspace:flags.workspace});
    }
    if(command==='check')return check({staged:!!flags.staged});
    if(command==='scheduled-run')return scheduledRun();
    throw new Error('Unknown subcommand. Use --help.');
  }
  const result=await (mutating?withLock(execute):execute());
  console.log(typeof result==='string'?result:JSON.stringify(result,null,2));
  if(result?.ok===false||result?.failed?.length||result?.failures?.length)process.exitCode=1;
}catch(error){console.error('brain: '+error.message);process.exitCode=1;}
