export const CAPTURE_MS = 8000,
  CATCH_UP_MS = 3000;

// Every queued capture plays in full; a backlog beyond three shortens the later ones.
export const captureDuration = waiting => (waiting > 3 ? CATCH_UP_MS : CAPTURE_MS);

// The domain an activity event names through its hub node, if any.
export const hubDomain = node => node?.match(/^knowledge\/(.+)\/INDEX\.md$/)?.[1] ?? null;
