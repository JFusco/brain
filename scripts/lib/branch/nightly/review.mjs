import { HOUR } from '../../leaf/time.mjs';
import { activeRun } from './run.mjs';

function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
export function validateReview(
  review,
  entry,
  head,
  notes,
  author = activeRun(entry.runId).authorId,
) {
  const t = Date.parse(review?.reviewedAt);
  if (
    review?.runId !== entry.runId ||
    review.headSha !== head ||
    review.baseSha !== entry.baseSha ||
    review.authorId !== author ||
    review.verdict !== 'approved' ||
    !text(review.summary) ||
    !text(review.reviewerId) ||
    !Number.isFinite(t) ||
    t < Date.parse(entry.createdAt) ||
    t > Date.now() ||
    Date.now() - t > HOUR
  )
    throw new Error('A fresh approved review of the exact run, base and head is required');
  if (notes.length && (review.reviewerId === author || review.role !== 'content-reviewer'))
    throw new Error('Changed knowledge requires a separate content reviewer');
  if (!notes.length && review.role !== 'author' && review.role !== 'content-reviewer')
    throw new Error('Record the actual review role');
  if (review.role === 'author' && review.reviewerId !== author)
    throw new Error('An author review must identify the actual run author');
  if (
    !Array.isArray(review.notes) ||
    JSON.stringify(review.notes.map(n => n.path).sort()) !== JSON.stringify(notes)
  )
    throw new Error('Review must cover every changed knowledge note or hub prose');
  for (const note of review.notes) {
    if (
      note.verdict !== 'approved' ||
      !['official', 'observation'].includes(note.evidenceKind) ||
      !['evidence', 'applicability', 'overlap', 'privacy'].every(k => text(note[k])) ||
      !Array.isArray(note.sources)
    )
      throw new Error('Record source, applicability, overlap and privacy decisions for every note');
    if (note.evidenceKind === 'official' && !note.sources.length)
      throw new Error('Documented claims require checked official sources');
    for (const source of note.sources) {
      const url = new URL(source);
      if (url.protocol !== 'https:' || url.username || url.password)
        throw new Error('Use sanitized HTTPS source URLs');
    }
  }
}
