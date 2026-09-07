import type { CriticalDate, Lease } from './types';

/** Amber threshold: deadline is approaching. */
export const AMBER_WINDOW_DAYS = 90;
/** Red threshold: deadline is overdue or due within this many days. */
export const RED_WINDOW_DAYS = 30;

export type DateSeverity = 'red' | 'amber' | 'ok';

export function severityFor(dueDate: string, today = new Date()): DateSeverity {
  const now = toISO(today);
  if (dueDate < now) return 'red';
  const days = daysUntil(dueDate, today);
  if (days <= RED_WINDOW_DAYS) return 'red';
  if (days <= AMBER_WINDOW_DAYS) return 'amber';
  return 'ok';
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysUntil(target: string, today: Date): number {
  const ms = Date.parse(`${target}T00:00:00Z`) - Date.parse(`${toISO(today)}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export interface LeaseAlert {
  lease: Lease;
  date: CriticalDate;
  severity: DateSeverity;
  days: number;
}

/**
 * Cross-references critical dates against their leases and returns the set
 * that requires attention, sorted most urgent first.
 */
export function alertsFor(
  leases: Lease[],
  dates: CriticalDate[],
  today = new Date(),
): LeaseAlert[] {
  const byId = new Map(leases.map((l) => [l.id, l]));
  return dates
    .map((date) => {
      const lease = byId.get(date.leaseId);
      if (!lease) return null;
      return {
        lease,
        date,
        severity: severityFor(date.dueDate, today),
        days: daysUntil(date.dueDate, today),
      } satisfies LeaseAlert;
    })
    .filter((a): a is LeaseAlert => a !== null)
    .filter((a) => a.severity !== 'ok')
    .sort((a, b) => a.days - b.days);
}
