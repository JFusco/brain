import { config } from '../platform/config.mjs';

// Routes a lesson to its configured domain by keyword score. Explicit capture is the only intake.
export function domainFor(text, keywords = config().keywords) {
  const lower = text.toLowerCase(),
    matches = Object.entries(keywords)
      .map(([domain, words]) => ({
        domain,
        score: words.reduce((n, w) => n + (lower.includes(w.toLowerCase()) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score);
  // WordPress context beats a tied generic match; other scores retain their ordering.
  const wordpress = matches.find(match => match.domain === 'cms/wordpress');
  if (
    wordpress?.score &&
    wordpress.score === matches[0]?.score &&
    ['react', 'frontend'].includes(matches[0].domain) &&
    /(?:\b(?:wordpress|gutenberg|add_action|add_filter)\b|@wordpress\/|\bwp[_-]|\b(?:theme|block)\.json\b|\bfunctions\.php\b)/i.test(
      text,
    )
  )
    return wordpress.domain;
  return matches[0]?.score ? matches[0].domain : '_unsorted';
}
