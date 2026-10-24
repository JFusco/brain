#!/usr/bin/env node
import fs from 'node:fs';
import { withLock } from './lib/branch/platform/lock.mjs';
import { args } from './lib/leaf/cli-args.mjs';
import { capture } from './lib/tree/capture/capture.mjs';
import * as inbox from './lib/tree/inbox/commands.mjs';
import { checkOfficial } from './lib/tree/official/check.mjs';
import { generateHubs } from './lib/tree/official/generate-hubs.mjs';
import { sync } from './lib/tree/official/sync.mjs';
import * as skills from './lib/tree/skills/suggest.mjs';
import { check } from './lib/tree/check/check.mjs';
import { lookup } from './lib/tree/lookup/lookup.mjs';
import { staleGuidance } from './lib/tree/curation/stale.mjs';
import { checkLinks } from './lib/tree/links/check.mjs';
import { linkSummary } from './lib/branch/links/summary.mjs';
import { recordPublication } from './lib/branch/publication/ledger.mjs';
import { maintenanceStatus } from './lib/tree/maintenance/status.mjs';
import { cleanExcerptCache } from './lib/branch/cache/excerpts.mjs';
import {
  vocabularyProfiles,
  vocabularyStatus,
  checkVocabularyRelease,
} from './lib/branch/packages/vocabulary.mjs';
import {
  uiPatterns,
  uiPatternsStatus,
  checkUiPatternsRelease,
} from './lib/branch/packages/ui-patterns.mjs';

const help = `Personal brain — explicit, local knowledge and official link catalogs

node scripts/brain.mjs visual serve [--port 4174]
node scripts/brain.mjs route --query <terms> [--domain nextjs] [--versions next@16] [--project <path> --workspace <app>] [--session <id>]
node scripts/brain.mjs brief --query <task> [--domain <domain>] [--project <path> --workspace <app>] [--versions next@16]
node scripts/brain.mjs playbooks [--domain <domain>] [--project <path> --workspace <app>] [--versions next@16]
node scripts/brain.mjs explain --node <knowledge-node-id> [--versions next@16]
node scripts/brain.mjs compare --from <node-id> --to <node-id> [--versions next@16]
node scripts/brain.mjs feedback --node <knowledge-note-id> --snapshot <main-sha> [--value helped|needs-clarification|did-not-apply|clear]
node scripts/brain.mjs activity start
node scripts/brain.mjs activity report --session <id> --type read|cited|complete [--node <id>] --event-id <uuid>
node scripts/brain.mjs activity summary [--period today|week|all]
node scripts/brain.mjs lookup --query <terms> [--domain nextjs] [--limit 5] [--fetch] [--project <path> --workspace <relative-app>] [--versions next@16,react@19]
  Add --cms-profile <exact-profile-id> for pinned CMS field facts.
  Add --ui-patterns for pinned UI naming and product guidance.
node scripts/brain.mjs vocabulary profiles
node scripts/brain.mjs vocabulary status
node scripts/brain.mjs vocabulary releases
node scripts/brain.mjs ui patterns
node scripts/brain.mjs ui status
node scripts/brain.mjs ui releases
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
node scripts/brain.mjs official sync [--hosted] [source-id...]
node scripts/brain.mjs official check
node scripts/brain.mjs skills suggest --project <path> [--workspace <relative-app>]
node scripts/brain.mjs check [--staged]

 Knowledge notes and registry edits publish when ordinary PRs merge.
 Nothing in this CLI commits, pushes, opens, or merges PRs.
Code changes are gated by pnpm run verify:ci.
`;

try {
  const { positional, flags } = args(process.argv.slice(2)),
    [command, subcommand, ...rest] = positional;
  const allowed = {
    visual: ['port'],
    route: ['query', 'domain', 'versions', 'project', 'workspace', 'session'],
    brief: ['query', 'domain', 'versions', 'project', 'workspace', 'session'],
    playbooks: ['domain', 'versions', 'project', 'workspace'],
    explain: ['node', 'snapshot', 'versions', 'project', 'workspace'],
    compare: ['from', 'to', 'snapshot', 'versions', 'project', 'workspace'],
    feedback: ['node', 'snapshot', 'value'],
    activity: ['session', 'type', 'node', 'event-id', 'period'],
    lookup: [
      'query',
      'domain',
      'limit',
      'fetch',
      'project',
      'workspace',
      'versions',
      'cms-profile',
      'ui-patterns',
    ],
    vocabulary: [],
    ui: [],
    capture: ['stdin', 'domain'],
    inbox: ['domain', 'all', 'backlog', 'as', 'pr'],
    curation: ['limit'],
    links: ['source', 'limit', 'retry-failures'],
    maintenance: ['yes', 'phase', 'run-id', 'outcome', 'pr', 'trigger'],
    official: ['hosted'],
    skills: ['project', 'workspace'],
    check: ['staged'],
  };
  if (!command || command === 'help' || flags.help) {
    console.log(help);
    process.exit(0);
  }
  if (!Object.hasOwn(allowed, command)) throw new Error('Unknown command. Use --help.');
  for (const key of Object.keys(flags))
    if (!allowed[command].includes(key))
      throw new Error(`Unsupported option --${key} for ${command}`);
  const mutating =
    (command === 'feedback' && flags.value !== undefined) ||
    (['vocabulary', 'ui'].includes(command) && subcommand === 'releases') ||
    (command === 'lookup' && flags.fetch) ||
    command === 'curation' ||
    command === 'capture' ||
    (command === 'links' && subcommand === 'check') ||
    (command === 'maintenance' &&
      (subcommand === 'publication' || (subcommand === 'cleanup' && flags.yes))) ||
    (command === 'inbox' && ['resolve', 'rescan'].includes(subcommand)) ||
    (command === 'official' && subcommand === 'sync');
  async function execute() {
    if (command === 'visual' && subcommand === 'serve')
      return (await import('./lib/visual-brain/server.mjs')).serve({ port: flags.port });
    if (command === 'route')
      return (await import('./lib/visual-brain/retrieval.mjs')).route({
        query: flags.query,
        domain: flags.domain,
        versions: flags.versions,
        project: flags.project,
        workspace: flags.workspace,
        session: flags.session,
      });
    if (['brief', 'playbooks', 'explain', 'compare'].includes(command))
      return (await import('./lib/visual-brain/guidance-tools.mjs'))[command](flags);
    if (command === 'feedback')
      return (await import('./lib/visual-brain/feedback.mjs')).feedback(flags);
    if (command === 'activity') {
      const m = await import('./lib/visual-brain/metrics.mjs');
      if (subcommand === 'start')
        return m.startSession((await import('./lib/visual-brain/snapshot.mjs')).mainRevision());
      if (subcommand === 'summary') return m.summary(flags.period);
      if (subcommand === 'report')
        return (await import('./lib/visual-brain/retrieval.mjs')).reportActivity({
          session: flags.session,
          node: flags.node,
          type: flags.type,
          eventId: flags['event-id'],
        });
    }
    if (command === 'lookup') {
      const activity = await import('./lib/visual-brain/retrieval.mjs'),
        session = await activity.beginLookupActivity();
      let result;
      try {
        result = await lookup({
          query: flags.query,
          domain: flags.domain,
          limit: flags.limit ?? 5,
          fetch: !!flags.fetch,
          project: flags.project,
          workspace: flags.workspace,
          versions: flags.versions,
          cmsProfile: flags['cms-profile'],
          uiPatterns: !!flags['ui-patterns'],
        });
      } catch (error) {
        await activity.lookupActivityFailed(session);
        throw error;
      }
      await activity.recordOrdinaryLookup(result, { session });
      return result;
    }
    if (command === 'vocabulary') {
      if (subcommand === 'profiles') return vocabularyProfiles();
      if (subcommand === 'status') return vocabularyStatus();
      if (subcommand === 'releases') return checkVocabularyRelease();
    }
    if (command === 'ui') {
      if (subcommand === 'patterns') return uiPatterns();
      if (subcommand === 'status') return uiPatternsStatus();
      if (subcommand === 'releases') return checkUiPatternsRelease();
    }
    if (command === 'capture') {
      if (!flags.stdin) throw new Error('Use capture --stdin');
      const result = capture(fs.readFileSync(0, 'utf8'), { domain: flags.domain });
      await (await import('./lib/visual-brain/retrieval.mjs')).recordCaptureActivity(result);
      return result;
    }
    if (command === 'inbox') {
      if (subcommand === 'list')
        return inbox.list({ domain: flags.domain, all: !!flags.all, backlog: !!flags.backlog });
      if (subcommand === 'show') return inbox.show(rest[0]);
      if (subcommand === 'rescan') return inbox.rescan(rest);
      if (subcommand === 'resolve') {
        if (!rest.length) throw new Error('Candidate IDs are required');
        return inbox.resolve(rest, flags.as, { pr: flags.pr });
      }
    }
    if (command === 'curation') {
      if (subcommand === 'stale') return staleGuidance({ limit: flags.limit ?? 12, write: true });
      if (subcommand === 'hubs') return { changed: generateHubs() };
    }
    if (command === 'links') {
      if (subcommand === 'check')
        return checkLinks({
          source: flags.source,
          limit: flags.limit ?? 24,
          retryFailures: !!flags['retry-failures'],
        });
      if (subcommand === 'status') return linkSummary();
    }
    if (command === 'maintenance') {
      if (subcommand === 'status') return maintenanceStatus();
      if (subcommand === 'cleanup') return cleanExcerptCache({ yes: !!flags.yes });
      if (subcommand === 'publication')
        return recordPublication({
          phase: flags.phase,
          runId: flags['run-id'],
          outcome: flags.outcome,
          pr: flags.pr,
          trigger: flags.trigger || 'manual',
        });
    }
    if (command === 'official') {
      if (subcommand === 'sync')
        return sync({ ids: rest.length ? rest : null, hosted: !!flags.hosted });
      if (subcommand === 'check') return checkOfficial();
    }
    if (command === 'skills') {
      if (subcommand === 'suggest')
        return skills.suggest(flags.project, { workspace: flags.workspace });
    }
    if (command === 'check') return check({ staged: !!flags.staged });
    throw new Error('Unknown subcommand. Use --help.');
  }
  const result = await (mutating ? withLock(execute) : execute());
  console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  if (result?.ok === false || result?.failed?.length || result?.failures?.length)
    process.exitCode = 1;
} catch (error) {
  console.error('brain: ' + error.message);
  process.exitCode = 1;
}
