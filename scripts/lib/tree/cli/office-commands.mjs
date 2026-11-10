import { boundedStdin } from '../../leaf/bounded-stdin.mjs';
import { readOnlyScan } from '../../branch/privacy/scan-receipt.mjs';
import { publishedMap } from '../../branch/office/published-map.mjs';
import { publishedSearch } from '../../branch/office/published-search.mjs';
import { publishedRead } from '../../branch/office/published-read.mjs';
const B = 'node scripts/brain.mjs';
const noPositionals = (rest, subcommand) => {
  if (rest.length || subcommand) throw new Error('Unexpected positional argument');
};
export const officeCommands = {
  scan: {
    flags: ['stdin', 'secrets-only'],
    usage: [`${B} scan --stdin --secrets-only`],
    run: (flags, rest, subcommand) => {
      noPositionals(rest, subcommand);
      if (!flags.stdin || !flags['secrets-only'])
        throw new Error('Use scan --stdin --secrets-only');
      return readOnlyScan(boundedStdin(1024 * 1024));
    },
  },
  snapshot: {
    flags: ['snapshot', 'cursor'],
    usage: [`${B} snapshot [--snapshot SHA] [--cursor CURSOR]`],
    run: (flags, rest, subcommand) => {
      noPositionals(rest, subcommand);
      return publishedMap(flags);
    },
  },
  search: {
    flags: ['snapshot', 'query', 'limit', 'kind', 'versions'],
    usage: [
      `${B} search --snapshot SHA --query QUERY --kind note [--limit 5] [--versions next@16,react@19]`,
    ],
    run: (flags, rest, subcommand) => {
      noPositionals(rest, subcommand);
      return publishedSearch(flags);
    },
  },
  read: {
    flags: ['snapshot', 'path'],
    usage: [`${B} read --snapshot SHA --path knowledge/DOMAIN/NOTE.md`],
    run: (flags, rest, subcommand) => {
      noPositionals(rest, subcommand);
      return publishedRead(flags.snapshot, flags.path);
    },
  },
};
