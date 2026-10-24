// The weekly reference-health issue body. `run` is { repository, runId, runURL }.
export const MARKER = '<!-- brain-weekly-reference-health -->';
export const TITLE = '[Task] Brain weekly reference health';

export const short = value => (value ? `\`${value.slice(0, 12)}\`` : 'none');
export const driftLine = c =>
  `\`${c.id}\`: ${c.to === null ? 'source no longer registered' : c.from === null ? `new catalog at ${short(c.to)}` : c.from === c.to ? 'catalog metadata changed' : `${short(c.from)} → ${short(c.to)}`}`;
export const localLine = ids =>
  ids.length
    ? `${ids.map(id => `\`${id}\``).join(', ')} ${ids.length === 1 ? 'is' : 'are'} refreshed only by the local weekly sync, because ${ids.length === 1 ? 'its host refuses' : 'their hosts refuse'} GitHub-hosted runners.`
    : '';
export function body(
  { notes, failures, warnings, issues },
  { fingerprint, links, runs, drift, local },
  { repository, runId, runURL },
) {
  const list = (items, line) => (items.length ? items.map(line).join('\n') : 'None.');
  const shown = warnings.slice(0, 50);
  return `${MARKER}
## Summary

${notes.length} notes citing changed sources, ${failures.length} source refresh failures, ${warnings.length} link warnings and ${issues.length} check failures. ${drift.length} catalog${drift.length === 1 ? '' : 's'} also drifted upstream, which is routine and never opens this issue. ${local.length ? localLine(local) + ' ' : ''}Last updated by [run ${runId}](${runURL}).

## Notes citing changed sources

${list(notes, n => `- [${n.path}](https://github.com/${repository}/blob/main/${n.path}) cites \`${n.source}@${n.cited.slice(0, 12)}\`; the source is now ${short(n.current)}.`)}

## Source refresh failures

${list(failures, f => `- \`${f.source}\`: ${f.reason} (last success ${runs[f.source]?.lastSuccess?.slice(0, 10) || 'not recorded'}).`)}

## Link warnings

Checked ${links.checked} links from a pool of ${links.poolSize}; this is a bounded sample, not a full audit.

${list(shown, w => `- \`${w.source}\`: ${w.state} (${w.status ? `HTTP ${w.status}` : 'no HTTP response'}) — ${w.url}`)}${warnings.length > shown.length ? `\n- …and ${warnings.length - shown.length} more.` : ''}

## Check failures

${list(issues, i => `- ${i}`)}

## Routine catalog drift

Informational, as of this update; drift alone never opens this issue. The weekly catalog-refresh PR picks it up.

${list(drift, c => `- ${driftLine(c)}`)}

## Expected Outcome

- **Notes citing changed sources:** re-verify each claim against the current official page and update it through a knowledge PR. Never change only a hash or date.
- **Failures and link warnings:** fix registry routing through an ordinary issue-linked PR, which stops for review. A redirect or changed hash is not evidence that a claim is correct.

## Additional Notes

Fingerprint: ${fingerprint}. The issue is rewritten only when its findings change, and closed when a run finds none.
`;
}
