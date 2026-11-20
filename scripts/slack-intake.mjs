#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { primary, activeRun } from './lib/branch/nightly/run.mjs';
import { withLock } from './lib/branch/platform/lock.mjs';
import { parseJSON } from './lib/leaf/json.mjs';
import { researchReference } from './lib/tree/slack/reference.mjs';
import { roster, savePilotReview, slackSummary, slackWork } from './lib/tree/slack/intake.mjs';
import { inventory } from './lib/branch/slack/inventory.mjs';

try {
  const [action, runId, channel, stream, ...extra] = process.argv.slice(2);
  primary();
  let result;
  if (action === 'status' && !runId) result = slackSummary();
  else if (action === 'inventory' && !extra.length) {
    const run = activeRun(runId);
    if (run.trigger !== 'scheduled-agent' || run.mode || !roster().some(c => c.id === channel))
      throw new Error('Use a configured channel in its scheduled run');
    result = await inventory(channel, stream);
  } else {
    if (!['work', 'preview', 'page', 'review', 'reference'].includes(action) || !runId || channel)
      throw new Error(
        'Use status, work|preview|page|reference|review RUN_ID, or inventory RUN_ID CHANNEL pins|bookmarks',
      );
    const input = action === 'work' ? null : parseJSON(readFileSync(0, 'utf8'));
    result = await withLock(() => {
      const run = activeRun(runId);
      if (action === 'reference') return researchReference(run, input);
      return action === 'review' ? savePilotReview(run, input) : slackWork(run, action, input);
    });
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('brain Slack intake: ' + error.message);
  process.exitCode = 1;
}
