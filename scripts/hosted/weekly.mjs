#!/usr/bin/env node
// Weekly reference health. Runs only inside a trusted default-branch scheduled or manual GitHub run.
import fs from 'node:fs';
import { localLine } from '../lib/branch/hosted/issue-body.mjs';
import { weekly } from '../lib/tree/hosted/weekly.mjs';

const repository = 'JFusco/brain',
  runId = process.env.GITHUB_RUN_ID,
  event = process.env.GITHUB_EVENT_NAME;
if (
  process.env.GITHUB_REPOSITORY !== repository ||
  process.env.GITHUB_REF !== 'refs/heads/main' ||
  !/^\d+$/.test(runId || '') ||
  !['schedule', 'workflow_dispatch'].includes(event)
)
  throw new Error(
    'Weekly reference health requires a trusted Brain default-branch scheduled/manual run',
  );
const run = { repository, runId, runURL: `https://github.com/${repository}/actions/runs/${runId}` };
const report = await weekly(run);
if (process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `## Brain weekly reference health\n\n- Catalogs: ${report.refresh.changed} changed, ${report.refresh.unchanged} unchanged, ${report.refresh.failed} failed (working tree only; nothing committed).${report.drift.map(line => `\n  - ${line}`).join('')}${report.refresh.skipped.length ? `\n- Not refreshed here: ${localLine(report.refresh.skipped)}` : ''}\n- Notes citing changed sources: ${report.notes}.\n- Links: ${report.links.checked} checked of ${report.links.poolSize}; ${report.links.warnings} active warnings.\n- Check failures: ${report.checkIssues}.\n- Issue: ${report.outcome}${report.issue ? ` (#${report.issue})` : ''}.\n`,
  );
console.log(JSON.stringify(report, null, 2));
