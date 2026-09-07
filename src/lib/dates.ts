/**
 * Date helpers. All dates in the platform are treated as ISO `yyyy-MM-dd`
 * strings and formatted for display with the `en-US` locale.
 */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseISODate(value: string): Date {
  if (!ISO_DATE_RE.test(value)) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MS_PER_DAY = 86_400_000;

/** Whole-day difference `to - from`, computed on calendar dates. */
export function diffInDays(from: string, to: string): number {
  const a = parseISODate(from);
  const b = parseISODate(to);
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function formatDate(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

/** Long form for detail headers: "March 31, 2029". */
export function formatDateLong(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Month + year label for calendar grouping: "September 2026". */
export function formatMonthLabel(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/** Short weekday name: "Mon", "Tue", … */
export function formatWeekdayShort(value: string): string {
  return parseISODate(value).toLocaleDateString('en-US', { weekday: 'short' });
}

/** Day of month, zero-padded, for calendar tiles: "01", "15". */
export function formatDayOfMonth(value: string): string {
  return String(parseISODate(value).getDate()).padStart(2, '0');
}

export function formatRelativeDue(value: string, today = new Date()): string {
  const days = diffInDays(toISODate(today), value);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return '1 day overdue';
  if (days > 0) return `Due in ${days} days`;
  return `${Math.abs(days)} days overdue`;
}

export function addDays(value: string, days: number): string {
  const d = parseISODate(value);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(value: string, months: number): string {
  const d = parseISODate(value);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

export function isSameMonth(value: string, monthRef: Date): boolean {
  const d = parseISODate(value);
  return d.getFullYear() === monthRef.getFullYear() && d.getMonth() === monthRef.getMonth();
}

/** True when `target` falls within `[start, end)` — used by recurring-exception logic. */
export function isWithin(target: string, start: string, end: string): boolean {
  return diffInDays(start, target) >= 0 && diffInDays(target, end) > 0;
}
