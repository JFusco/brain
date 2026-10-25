export const CAPTURE_MS = 8000,
  CATCH_UP_MS = 3000,
  BURST_MS = 1500;

// Every queued capture plays to completion; a backlog shortens the later ones.
export const captureDuration = waiting =>
  waiting > 12 ? BURST_MS : waiting > 3 ? CATCH_UP_MS : CAPTURE_MS;

// The domain an activity event names through its hub node, if any.
export const hubDomain = node => node?.match(/^knowledge\/(.+)\/INDEX\.md$/)?.[1] ?? null;
