/**
 * Small, dependency-free date/time formatting helpers.
 * Kept out of components so formatting is consistent and testable.
 */

/** "8:30 AM" style time from an ISO string. */
export function formatTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Monday, 5 May" style long date. */
export function formatLongDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Time-of-day greeting. */
export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "8:30 – 9:15 AM" compact range from two ISO strings. */
export function formatTimeRange(startIso: string, endIso: string): string {
  const start = formatTime(startIso);
  const end = formatTime(endIso);
  if (!start && !end) return '';
  return `${start} – ${end}`;
}
