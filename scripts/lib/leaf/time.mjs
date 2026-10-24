export const HOUR = 3600000;
export const DAY = 24 * HOUR;
export const now = () => new Date().toISOString();
// Missing, unparseable or older than `hours`.
export const overdue = (value, hours) =>
  !value || !Number.isFinite(Date.parse(value)) || Date.now() - Date.parse(value) > hours * HOUR;
