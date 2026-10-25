import fs from 'node:fs';
import {
  checkUiPatternsRelease,
  uiPatterns,
  uiPatternsStatus,
} from '../../branch/packages/ui-patterns.mjs';
import {
  checkVocabularyRelease,
  vocabularyProfiles,
  vocabularyStatus,
} from '../../branch/packages/vocabulary.mjs';
import { capture } from '../capture/capture.mjs';
import { staleGuidance } from '../curation/stale.mjs';
import * as inbox from '../inbox/commands.mjs';
import { lookup } from '../lookup/lookup.mjs';
import { generateHubs } from '../official/generate-hubs.mjs';

// Lookup, pinned package data, capture, the private inbox and curation.
const B = 'node scripts/brain.mjs';
const activity = () => import('../../branch/activity/reporting.mjs');

async function recordedLookup(flags) {
  const reporting = await activity(),
    session = await reporting.beginLookupActivity(undefined, 'cli', flags.domain);
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
    await reporting.lookupActivityFailed(session);
    throw error;
  }
  await reporting.recordOrdinaryLookup(result, { session });
  return result;
}

export const knowledgeCommands = {
  lookup: {
    flags: [
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
    usage: [
      `${B} lookup --query <terms> [--domain nextjs] [--limit 5] [--fetch] [--project <path> --workspace <relative-app>] [--versions next@16,react@19]`,
      '  Add --cms-profile <exact-profile-id> for pinned CMS field facts.',
      '  Add --ui-patterns for pinned UI naming and product guidance.',
    ],
    mutating: (subcommand, flags) => !!flags.fetch,
    run: recordedLookup,
  },
  vocabulary: {
    flags: [],
    usage: [`${B} vocabulary profiles`, `${B} vocabulary status`, `${B} vocabulary releases`],
    mutating: subcommand => subcommand === 'releases',
    subcommands: {
      profiles: () => vocabularyProfiles(),
      status: () => vocabularyStatus(),
      releases: () => checkVocabularyRelease(),
    },
  },
  ui: {
    flags: [],
    usage: [`${B} ui patterns`, `${B} ui status`, `${B} ui releases`],
    mutating: subcommand => subcommand === 'releases',
    subcommands: {
      patterns: () => uiPatterns(),
      status: () => uiPatternsStatus(),
      releases: () => checkUiPatternsRelease(),
    },
  },
  capture: {
    flags: ['stdin', 'domain'],
    usage: [`${B} capture --stdin [--domain tailwind]`],
    mutating: () => true,
    run: async flags => {
      if (!flags.stdin) throw new Error('Use capture --stdin');
      const result = capture(fs.readFileSync(0, 'utf8'), { domain: flags.domain });
      await (await activity()).recordCaptureActivity(result);
      return result;
    },
  },
  inbox: {
    flags: ['domain', 'all', 'backlog', 'as', 'pr'],
    usage: [
      `${B} inbox list [--domain nextjs] [--all] [--backlog]`,
      `${B} inbox show <candidate-id>`,
      `${B} inbox rescan [<candidate-id...>]`,
      `${B} inbox resolve <candidate-id...> --as rejected|superseded`,
      `${B} inbox resolve <candidate-id...> --as accepted --pr <merged-number>`,
    ],
    mutating: subcommand => ['resolve', 'rescan'].includes(subcommand),
    subcommands: {
      list: flags =>
        inbox.list({ domain: flags.domain, all: !!flags.all, backlog: !!flags.backlog }),
      show: (flags, rest) => inbox.show(rest[0]),
      rescan: (flags, rest) => inbox.rescan(rest),
      resolve: (flags, rest) => {
        if (!rest.length) throw new Error('Candidate IDs are required');
        return inbox.resolve(rest, flags.as, { pr: flags.pr });
      },
    },
  },
  curation: {
    flags: ['limit'],
    usage: [`${B} curation stale [--limit 12]`, `${B} curation hubs`],
    mutating: () => true,
    subcommands: {
      stale: flags => staleGuidance({ limit: flags.limit ?? 12, write: true }),
      hubs: () => ({ changed: generateHubs() }),
    },
  },
};
