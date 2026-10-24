import { CHECKS } from './checks.mjs';

const STAGES = ['refresh', 'links', 'curation', 'review', 'verification'];

// A run report must carry actual evidence for every stage and match its recorded PRs.
export function validateReport(report, attempt) {
  if (report?.runId !== attempt.id || !['published', 'unchanged'].includes(report.outcome))
    throw new Error('Provide the actual run report and outcome');
  for (const name of STAGES)
    if (
      !['completed', 'unnecessary'].includes(report.stages?.[name]?.outcome) ||
      !report.stages[name].summary?.trim()
    )
      throw new Error(`Missing actual ${name} evidence`);
  if (
    report.stages.review.outcome !== 'completed' ||
    report.stages.verification.outcome !== 'completed'
  )
    throw new Error('Review and verification cannot be skipped');
  if (attempt.protocolVersion !== 2)
    for (const command of CHECKS)
      if (!report.checks?.some(c => c.command === command && c.exitCode === 0))
        throw new Error('Required local checks did not pass');
  if (
    !Array.isArray(report.prs) ||
    (report.outcome === 'unchanged' && report.prs.length) ||
    (report.outcome === 'published' && !report.prs.length)
  )
    throw new Error('Publication outcome differs from the recorded PRs');
}
