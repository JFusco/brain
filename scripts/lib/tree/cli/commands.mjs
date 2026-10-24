import { knowledgeCommands } from './knowledge-commands.mjs';
import { maintenanceCommands } from './maintenance-commands.mjs';
import { visualCommands } from './visual-commands.mjs';

// The whole CLI surface, in help order. Each command declares its options, usage lines,
// whether it mutates private state (and so takes the lock), and its handlers.
export const COMMANDS = { ...visualCommands, ...knowledgeCommands, ...maintenanceCommands };

export const HELP = `Personal brain — explicit, local knowledge and official link catalogs

${Object.values(COMMANDS)
  .flatMap(command => command.usage)
  .join('\n')}

 Knowledge notes and registry edits publish when ordinary PRs merge.
 Nothing in this CLI commits, pushes, opens, or merges PRs.
Code changes are gated by pnpm run verify:ci.
`;

// Validates a parsed invocation against the table. Returns what to run and whether it needs the lock.
export function plan(positional, flags) {
  const [command, subcommand, ...rest] = positional;
  if (!command || command === 'help' || flags.help) return { help: HELP };
  if (!Object.hasOwn(COMMANDS, command)) throw new Error('Unknown command. Use --help.');
  const spec = COMMANDS[command];
  for (const key of Object.keys(flags))
    if (!spec.flags.includes(key)) throw new Error(`Unsupported option --${key} for ${command}`);
  const execute = async () => {
    if (spec.run) return spec.run(flags, rest, subcommand);
    if (spec.subcommands && Object.hasOwn(spec.subcommands, subcommand ?? ''))
      return spec.subcommands[subcommand](flags, rest);
    throw new Error('Unknown subcommand. Use --help.');
  };
  return { mutating: !!spec.mutating?.(subcommand, flags), execute };
}
