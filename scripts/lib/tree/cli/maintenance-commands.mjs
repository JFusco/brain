import { cleanExcerptCache } from '../../branch/cache/excerpts.mjs';
import { linkSummary } from '../../branch/links/summary.mjs';
import { recordPublication } from '../../branch/publication/ledger.mjs';
import { check } from '../check/check.mjs';
import { checkLinks } from '../links/check.mjs';
import { maintenanceStatus } from '../maintenance/status.mjs';
import { checkOfficial } from '../official/check.mjs';
import { sync } from '../official/sync.mjs';
import * as skills from '../skills/suggest.mjs';

// Link health, maintenance bookkeeping, official catalogs, skill suggestions and the repository gate.
const B = 'node scripts/brain.mjs';

export const maintenanceCommands = {
  links: {
    flags: ['source', 'limit', 'retry-failures'],
    usage: [
      `${B} links check [--source <id>] [--limit 24] [--retry-failures]`,
      `${B} links status`,
    ],
    mutating: subcommand => subcommand === 'check',
    subcommands: {
      check: flags =>
        checkLinks({
          source: flags.source,
          limit: flags.limit ?? 24,
          retryFailures: !!flags['retry-failures'],
        }),
      status: () => linkSummary(),
    },
  },
  maintenance: {
    flags: ['yes', 'phase', 'run-id', 'outcome', 'pr', 'trigger'],
    usage: [
      `${B} maintenance status`,
      `${B} maintenance cleanup [--yes]`,
      `${B} maintenance publication --phase started|completed|failed [--run-id <id>] [--outcome published|unchanged] [--pr <number>] [--trigger manual|scheduled-agent]`,
    ],
    mutating: (subcommand, flags) =>
      subcommand === 'publication' || (subcommand === 'cleanup' && !!flags.yes),
    subcommands: {
      status: () => maintenanceStatus(),
      cleanup: flags => cleanExcerptCache({ yes: !!flags.yes }),
      publication: flags =>
        recordPublication({
          phase: flags.phase,
          runId: flags['run-id'],
          outcome: flags.outcome,
          pr: flags.pr,
          trigger: flags.trigger || 'manual',
        }),
    },
  },
  official: {
    flags: ['hosted'],
    usage: [`${B} official sync [--hosted] [source-id...]`, `${B} official check`],
    mutating: subcommand => subcommand === 'sync',
    subcommands: {
      sync: (flags, rest) => sync({ ids: rest.length ? rest : null, hosted: !!flags.hosted }),
      check: () => checkOfficial(),
    },
  },
  skills: {
    flags: ['project', 'workspace'],
    usage: [`${B} skills suggest --project <path> [--workspace <relative-app>]`],
    subcommands: {
      suggest: flags => skills.suggest(flags.project, { workspace: flags.workspace }),
    },
  },
  check: {
    flags: ['staged'],
    usage: [`${B} check [--staged]`],
    run: flags => check({ staged: !!flags.staged }),
  },
};
