import { readJSON } from '../../leaf/json.mjs';
import { at } from '../../leaf/paths.mjs';
import { now, overdue } from '../../leaf/time.mjs';
import { staleGuidance } from '../curation/stale.mjs';
import { linkSummary } from '../../link-health.mjs';
import { vocabularyStatus } from '../../branch/packages/vocabulary.mjs';
import { uiPatternsStatus } from '../../branch/packages/ui-patterns.mjs';

export function maintenanceStatus() {
  const runs = readJSON(at('.state/official-runs.json'), {}),
    registry = readJSON(at('official/sources.json'), { sources: [] }),
    active = readJSON(at('official/sources.lock.json'), { sources: {} }),
    publication = readJSON(at('.state/publication.json'), {});
  const errors = [],
    warnings = [];
  const sources = registry.sources.map(spec => {
    const run = runs[spec.id] || {},
      entry = active.sources[spec.id];
    return {
      source: spec.id,
      revision: entry?.revision || null,
      fetchedAt: entry?.fetchedAt || null,
      catalogAgeDays: Number.isFinite(Date.parse(entry?.fetchedAt))
        ? Math.floor((Date.now() - Date.parse(entry.fetchedAt)) / 86400000)
        : null,
      lastLocalAttempt: run.lastAttempt || null,
      lastLocalSuccess: run.lastSuccess || null,
      failures: run.failures || 0,
    };
  });
  if (publication.activeRun && overdue(publication.activeRun.startedAt, 2))
    errors.push('Publication was started but has no completion record');
  if (publication.lastOutcome === 'failed') errors.push('The latest publication attempt failed');
  if (!publication.lastSuccess)
    warnings.push(
      'Awaiting the first recorded publication run; configuration is not unattended execution proof',
    );
  const guidance = staleGuidance({ limit: 12 });
  if (guidance.total) warnings.push('Curated guidance is due for source/claim revalidation');
  const nightly = readJSON(at('.state/nightly.json'), {});
  const vocabulary = vocabularyStatus();
  if (!vocabulary.ok) warnings.push('CMS vocabulary installation or release check needs attention');
  if (vocabulary.release?.updateAvailable)
    warnings.push(
      'A newer CMS vocabulary release is available; the installed version remains pinned',
    );
  const uiPatterns = uiPatternsStatus();
  if (!uiPatterns.ok)
    warnings.push('UI Design Brain installation or release check needs attention');
  if (uiPatterns.release?.updateAvailable)
    warnings.push(
      'A newer UI Design Brain release is available; the installed version remains pinned',
    );
  return {
    ok: !errors.length,
    checkedAt: now(),
    errors,
    warnings,
    references: {
      execution: 'local',
      timezone: 'America/New_York',
      window: '03:15',
      notice:
        'The local nightly automation refreshes catalogs, samples links, curates and reviews additions, and verifies publication. Reference-maintenance Actions are disabled; the Wiki integrity PR check remains enabled.',
    },
    nightly: {
      active: nightly.active || null,
      lastFailure: nightly.lastFailure || null,
      completedDates: Object.keys(nightly.completed || {}).sort(),
      retryAfter: nightly.retryAfter || null,
    },
    sources,
    vocabulary,
    uiPatterns,
    publication: {
      lastAttempt: publication.lastAttempt || null,
      lastSuccess: publication.lastSuccess || null,
      lastOutcome: publication.lastOutcome || null,
      lastPr: publication.lastPr || null,
      activeRun: publication.activeRun || null,
      trigger: publication.trigger || null,
    },
    links: linkSummary(),
    guidance: { due: guidance.total },
    notice:
      'Local jobs require an awake Mac and running app. Agent-reported publication records distinguish manual from scheduled invocation; they are not independent scheduler attestations. Link counts are bounded local samples.',
  };
}
