/**
 * Shared date formatting and utility functions.
 * Single source of truth — avoids duplicating date helpers across components.
 */

/** Returns today's date as YYYY-MM-DD in local time. */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Format a date string as "Mon, Jan 1" (short — for tables). */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Format a date string as "Monday, January 1, 2025" (long — for dialog descriptions). */
export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Add (or subtract) days from a YYYY-MM-DD string and return a new YYYY-MM-DD string. */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00') // noon to avoid DST issues
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Format a timestamp (ms or Date) as "Jan 1" (compact — for chart axes/tooltips). */
export function formatDateCompact(ms: number | Date): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
