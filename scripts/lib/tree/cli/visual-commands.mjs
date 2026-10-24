// Visual Brain, guidance and activity commands. They load on demand, so other commands stay fast.
const B = 'node scripts/brain.mjs';
const GRAPH_FLAGS = ['versions', 'project', 'workspace'];

// Explicit specifiers keep every module statically checkable.
const GUIDANCE = {
  brief: () => import('../visual/brief.mjs'),
  playbooks: () => import('../visual/playbooks.mjs'),
  explain: () => import('../visual/explain.mjs'),
  compare: () => import('../visual/compare.mjs'),
};
const guidance = name => async flags => (await GUIDANCE[name]())[name](flags);

export const visualCommands = {
  visual: {
    flags: ['port'],
    usage: [`${B} visual serve [--port 4174]`],
    subcommands: {
      serve: async flags =>
        (await import('../visual/server/server.mjs')).serve({ port: flags.port }),
    },
  },
  route: {
    flags: ['query', 'domain', ...GRAPH_FLAGS, 'session'],
    usage: [
      `${B} route --query <terms> [--domain nextjs] [--versions next@16] [--project <path> --workspace <app>] [--session <id>]`,
    ],
    run: async flags =>
      (await import('../visual/route.mjs')).route({
        query: flags.query,
        domain: flags.domain,
        versions: flags.versions,
        project: flags.project,
        workspace: flags.workspace,
        session: flags.session,
      }),
  },
  brief: {
    flags: ['query', 'domain', ...GRAPH_FLAGS, 'session'],
    usage: [
      `${B} brief --query <task> [--domain <domain>] [--project <path> --workspace <app>] [--versions next@16]`,
    ],
    run: guidance('brief'),
  },
  playbooks: {
    flags: ['domain', ...GRAPH_FLAGS],
    usage: [
      `${B} playbooks [--domain <domain>] [--project <path> --workspace <app>] [--versions next@16]`,
    ],
    run: guidance('playbooks'),
  },
  explain: {
    flags: ['node', 'snapshot', ...GRAPH_FLAGS],
    usage: [`${B} explain --node <knowledge-node-id> [--versions next@16]`],
    run: guidance('explain'),
  },
  compare: {
    flags: ['from', 'to', 'snapshot', ...GRAPH_FLAGS],
    usage: [`${B} compare --from <node-id> --to <node-id> [--versions next@16]`],
    run: guidance('compare'),
  },
  feedback: {
    flags: ['node', 'snapshot', 'value'],
    usage: [
      `${B} feedback --node <knowledge-note-id> --snapshot <main-sha> [--value helped|needs-clarification|did-not-apply|clear]`,
    ],
    mutating: (subcommand, flags) => flags.value !== undefined,
    run: async flags => (await import('../visual/feedback.mjs')).feedback(flags),
  },
  activity: {
    flags: ['session', 'type', 'node', 'event-id', 'period'],
    usage: [
      `${B} activity start`,
      `${B} activity report --session <id> --type read|cited|complete [--node <id>] --event-id <uuid>`,
      `${B} activity summary [--period today|week|all]`,
    ],
    subcommands: {
      start: async () =>
        (await import('../../branch/activity/sessions.mjs')).startSession(
          (await import('../../branch/visual/snapshot/blobs.mjs')).mainRevision(),
        ),
      summary: async flags =>
        (await import('../../branch/activity/summary.mjs')).summary(flags.period),
      report: async flags =>
        (await import('../../branch/activity/reporting.mjs')).reportActivity({
          session: flags.session,
          node: flags.node,
          type: flags.type,
          eventId: flags['event-id'],
        }),
    },
  },
};
