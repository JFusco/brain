import { DAY } from '../../leaf/time.mjs';

export const ZONE = 'America/New_York';
export const WINDOW = '03:15';
const WINDOW_MINUTES = 3 * 60 + 15;

// The date whose nightly work is due at a moment: before 03:15 New York time, the previous day.
export function dueDate(at = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(at)
      .map(p => [p.type, p.value]),
  );
  const date = `${p.year}-${p.month}-${p.day}`;
  return Number(p.hour) * 60 + Number(p.minute) >= WINDOW_MINUTES
    ? date
    : new Date(Date.parse(date) - DAY).toISOString().slice(0, 10);
}
