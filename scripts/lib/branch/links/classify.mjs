import { DAY, HOUR } from '../../leaf/time.mjs';

// A probe result as a health state. Two 404s in a row, or a 410, establish a dead link.
export function classify(observed, previous) {
  const streak =
    observed.status === 404
      ? previous.status === 404
        ? (previous.notFoundStreak || 1) + 1
        : 1
      : 0;
  const classification =
    observed.state ||
    (observed.status === 410 || streak >= 2
      ? 'dead'
      : observed.status === 404
        ? 'suspected-dead'
        : [401, 403, 451].includes(observed.status)
          ? 'restricted'
          : observed.status === 429
            ? 'rate-limited'
            : observed.status >= 500
              ? 'transient-error'
              : observed.status >= 200 && observed.status < 300
                ? observed.redirects.length
                  ? 'redirected'
                  : 'healthy'
                : 'unavailable');
  return { streak, classification };
}

// Honors Retry-After (seconds or a date) within one hour to one day.
export function retryDelay(observed, now = Date.now()) {
  const delay = Number(observed.retryAfter),
    retryMs = observed.retryAfter
      ? Number.isFinite(delay)
        ? delay * 1000
        : Date.parse(observed.retryAfter) - now
      : 0;
  return Math.min(DAY, Math.max(HOUR, retryMs || 0));
}
