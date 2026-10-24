import { WINDOW, ZONE } from '../../branch/nightly/schedule.mjs';

export function status(state, slotDate) {
  return {
    timezone: ZONE,
    window: WINDOW,
    slotDate,
    completed: state.completed[slotDate] || null,
    active: state.active || null,
    attempts: state.attempts[slotDate] || 0,
    retryAfter: state.retryAfter || null,
    lastFailure: state.lastFailure || null,
    manualReruns: state.manual || null,
    notice:
      'Local execution requires an awake Mac and running app. Missed dates coalesce. Publication receipts bind review and executed checks to exact commits; reviewer identity is agent-reported.',
  };
}
