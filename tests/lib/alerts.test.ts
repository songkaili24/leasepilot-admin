import { describe, expect, it } from 'vitest';
import { severityFor, alertsFor, AMBER_WINDOW_DAYS, RED_WINDOW_DAYS } from '@/lib/alerts';
import { leases } from '@/lib/data/leases';
import { criticalDates } from '@/lib/data/critical-dates';
import { toISODate } from '@/lib/dates';

const TODAY = toISODate(new Date());

describe('severityFor', () => {
  it('marks overdue and near-term dates red', () => {
    expect(severityFor('2020-01-01')).toBe('red');
    expect(severityFor(TODAY)).toBe('red'); // due today is inside the red window
  });

  it('marks the amber planning window', () => {
    const inAmber = addDaysISO(TODAY, RED_WINDOW_DAYS + 1);
    expect(severityFor(inAmber)).toBe('amber');
  });

  it('is calm beyond the amber window', () => {
    const farOut = addDaysISO(TODAY, AMBER_WINDOW_DAYS + 1);
    expect(severityFor(farOut)).toBe('ok');
  });

  it('treats the window edges inclusively', () => {
    expect(severityFor(addDaysISO(TODAY, RED_WINDOW_DAYS))).toBe('red');
    expect(severityFor(addDaysISO(TODAY, AMBER_WINDOW_DAYS))).toBe('amber');
  });
});

describe('alertsFor (dashboard action queue)', () => {
  it('joins dates to leases and drops orphans instead of crashing', () => {
    const orphans = [
      ...criticalDates,
      { ...criticalDates[0], id: 'orphan', leaseId: 'l-does-not-exist' },
    ];
    const alerts = alertsFor(leases, orphans);
    expect(alerts.every((a) => leases.some((l) => l.id === a.lease.id))).toBe(true);
  });

  it('only surfaces red/amber items, sorted most urgent first', () => {
    const alerts = alertsFor(leases, criticalDates);
    expect(alerts.length).toBeGreaterThan(0);
    for (const alert of alerts) {
      expect(['red', 'amber']).toContain(alert.severity);
    }
    for (let i = 1; i < alerts.length; i++) {
      expect(alerts[i - 1].days).toBeLessThanOrEqual(alerts[i].days);
    }
  });
});

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
