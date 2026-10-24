import { withLock } from '../../branch/platform/lock.mjs';
import { sha } from '../../leaf/hash.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { driftLine } from '../../branch/hosted/issue-body.mjs';
import { restorePrevious } from '../../branch/hosted/previous-state.mjs';
import { registry } from '../../branch/official/registry.mjs';
import { check } from '../check/check.mjs';
import { staleGuidance } from '../curation/stale.mjs';
import { checkLinks } from '../links/check.mjs';
import { sync } from '../official/sync.mjs';
import { deliver } from './deliver.mjs';

// Refresh catalogs in the runner (never committed), sample links, run check and keep one issue.
// `run` is { repository, runId, runURL } for the trusted GitHub run.
export function weekly(run) {
  return withLock(async () => {
    restorePrevious();
    const refresh = await sync({ hosted: true }),
      skipHosts = registry().runnerBlockedHosts || [];
    const notes = staleGuidance({ limit: 100 }).pages.flatMap(page =>
      page.reasons
        .filter(r => r.kind === 'source-changed')
        .map(r => ({ path: page.path, source: r.source, cited: r.cited, current: r.current })),
    );
    const links = await checkLinks({ limit: 100, skipHosts }),
      pointers = await checkLinks({ source: 'website-pointers', limit: 24, skipHosts });
    const state = readJSON(at('.state/link-health.json'), { links: {} });
    const warnings = Object.values(state.links)
      .filter(r => r.active !== false && !['healthy', 'redirected'].includes(r.state))
      .map(r => ({ source: r.source, url: r.url, state: r.state, status: r.status ?? null }))
      .sort((a, b) => a.source.localeCompare(b.source) || a.url.localeCompare(b.url));
    let issues;
    try {
      issues = check().issues;
    } catch (error) {
      issues = [error.message];
    }
    const findings = {
      notes,
      failures: refresh.failed.map(f => ({ source: f.id, reason: f.error })),
      warnings,
      issues,
    };
    const fingerprint = sha(JSON.stringify(findings));
    const delivery = deliver(
      findings,
      {
        fingerprint,
        drift: refresh.changed,
        local: refresh.skipped,
        links: { checked: links.checked + pointers.checked, poolSize: links.poolSize },
        runs: readJSON(at('.state/official-runs.json'), {}),
      },
      run,
    );
    return {
      refresh: {
        changed: refresh.changed.length,
        unchanged: refresh.unchanged.length,
        failed: refresh.failed.length,
        skipped: refresh.skipped,
      },
      drift: refresh.changed.map(driftLine),
      notes: notes.length,
      links: {
        checked: links.checked + pointers.checked,
        poolSize: links.poolSize,
        warnings: warnings.length,
      },
      checkIssues: issues.length,
      ...delivery,
    };
  });
}
