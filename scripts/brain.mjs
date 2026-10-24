#!/usr/bin/env node
import { withLock } from './lib/branch/platform/lock.mjs';
import { args } from './lib/leaf/cli-args.mjs';
import { plan } from './lib/tree/cli/commands.mjs';

try {
  const { positional, flags } = args(process.argv.slice(2));
  const invocation = plan(positional, flags);
  if (invocation.help) {
    console.log(invocation.help);
    process.exit(0);
  }
  const result = await (invocation.mutating ? withLock(invocation.execute) : invocation.execute());
  console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  if (result?.ok === false || result?.failed?.length || result?.failures?.length)
    process.exitCode = 1;
} catch (error) {
  console.error('brain: ' + error.message);
  process.exitCode = 1;
}
