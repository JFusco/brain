import { config } from '../platform/config.mjs';
import { at } from '../../leaf/paths.mjs';
import { readJSON } from '../../leaf/json.mjs';
import { scalar } from '../../leaf/frontmatter.mjs';

export function guidanceState(
  raw,
  active = readJSON(at('official/sources.lock.json'), { sources: {} }),
) {
  const status = scalar(raw, 'status') || 'current',
    reasons = [];
  if (status !== 'current')
    return { status, reasons, supersededBy: scalar(raw, 'superseded_by') || null };
  for (const match of scalar(raw, 'provenance').matchAll(
    /\b([a-z0-9][a-z0-9-]+)@([a-f0-9]{12,64})(?=$|[^a-f0-9])/g,
  )) {
    const current = active.sources[match[1]];
    if (!current) reasons.push({ kind: 'source-unavailable', source: match[1] });
    else if (!current.revision.startsWith(match[2]))
      reasons.push({
        kind: 'source-changed',
        source: match[1],
        cited: match[2],
        current: current.revision,
      });
  }
  const reviewed = scalar(raw, 'reviewed_at') || scalar(raw, 'evidence_date');
  const explicit = scalar(raw, 'review_after');
  const due = explicit
    ? Date.parse(explicit)
    : Date.parse(reviewed) + (config().curation?.reviewDays ?? 30) * 86400000;
  if (!Number.isFinite(due)) reasons.push({ kind: 'review-date-unknown' });
  else if (due <= Date.now())
    reasons.push({ kind: 'review-due', dueAt: new Date(due).toISOString() });
  return {
    status: reasons.length ? 'needs-revalidation' : 'current',
    reasons,
    reviewedAt: reviewed || null,
    reviewDueAt: Number.isFinite(due) ? new Date(due).toISOString() : null,
  };
}
