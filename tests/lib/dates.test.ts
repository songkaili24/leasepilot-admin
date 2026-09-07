import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  diffInDays,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatDayOfMonth,
  formatMonthLabel,
  formatRelativeDue,
  formatWeekdayShort,
  isSameMonth,
  isWithin,
  parseISODate,
  timeAgo,
  toISODate,
} from '@/lib/dates';

describe('parseISODate / toISODate round trip', () => {
  it('round-trips ISO dates without timezone drift', () => {
    for (const iso of ['2026-01-01', '2026-02-28', '2026-12-31', '2024-02-29']) {
      expect(toISODate(parseISODate(iso))).toBe(iso);
    }
  });

  it('rejects malformed input rather than silently rolling dates', () => {
    expect(() => parseISODate('not-a-date')).toThrow();
    expect(() => parseISODate('2026/01/01')).toThrow();
  });

  // [-BUG-] Out-of-range components (month 13, Feb 29 in a non-leap year) are
  // silently rolled forward by the Date constructor instead of being rejected.
  // parseISODate is a public util; callers relying on it to surface bad data
  // get a valid-looking date for an invalid input. Low severity today (all
  // current call sites pass internally generated ISO strings), but a trap for
  // future use.
  it('[-BUG parse-rollover] rejects out-of-range components instead of rolling them forward', () => {
    expect(() => parseISODate('2026-13-01')).toThrow();
    expect(() => parseISODate('2026-02-29')).toThrow(); // 2026 is not a leap year
  });
});

describe('addDays / addMonths', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  // AMBIGUOUS BEHAVIOR (documented, not asserted as a fix): JS setMonth rolls
  // Jan 31 + 1 month to Mar 3 rather than clamping to Feb 28. This feeds
  // lease-anniversary math (nextEscalationDate, rent schedule period edges),
  // so end-of-month commencements drift by a few days. Product should confirm
  // the intended anniversary convention (roll-forward vs clamp).
  it('rolls end-of-month additions into the next month (Jan 31 + 1mo = Mar 3)', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-03-03');
  });

  it('preserves day-of-month on ordinary months', () => {
    expect(addMonths('2026-03-15', 12)).toBe('2027-03-15');
  });
});

describe('diffInDays', () => {
  it('returns whole-day differences in both directions', () => {
    expect(diffInDays('2026-01-01', '2026-01-02')).toBe(1);
    expect(diffInDays('2026-01-02', '2026-01-01')).toBe(-1);
    expect(diffInDays('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('survives DST transitions without off-by-one (US DST: Mar 8 2026)', () => {
    expect(diffInDays('2026-03-07', '2026-03-09')).toBe(2);
    expect(diffInDays('2026-10-31', '2026-11-02')).toBe(2);
  });
});

describe('formatRelativeDue', () => {
  const today = new Date(2026, 8, 8); // 2026-09-08 local

  it('describes today, tomorrow, and yesterday precisely', () => {
    expect(formatRelativeDue('2026-09-08', today)).toBe('Due today');
    expect(formatRelativeDue('2026-09-09', today)).toBe('Due tomorrow');
    expect(formatRelativeDue('2026-09-07', today)).toBe('1 day overdue');
  });

  it('counts future and overdue windows', () => {
    expect(formatRelativeDue('2026-10-08', today)).toBe('Due in 30 days');
    expect(formatRelativeDue('2026-08-01', today)).toBe('38 days overdue');
  });
});

describe('isSameMonth / isWithin', () => {
  it('groups dates by month for the calendar grid', () => {
    const sep = new Date(2026, 8, 15);
    expect(isSameMonth('2026-09-01', sep)).toBe(true);
    expect(isSameMonth('2026-09-30', sep)).toBe(true);
    expect(isSameMonth('2026-08-31', sep)).toBe(false);
  });

  it('treats isWithin as [start, end) — end is exclusive', () => {
    expect(isWithin('2026-01-01', '2026-01-01', '2026-02-01')).toBe(true);
    expect(isWithin('2026-01-31', '2026-01-01', '2026-02-01')).toBe(true);
    expect(isWithin('2026-02-01', '2026-01-01', '2026-02-01')).toBe(false);
    expect(isWithin('2025-12-31', '2026-01-01', '2026-02-01')).toBe(false);
  });
});

describe('long-form and calendar formatters', () => {
  it('formats long dates for detail headers', () => {
    expect(formatDateLong('2026-09-08')).toBe('September 8, 2026');
  });

  it('formats month labels for calendar grouping', () => {
    expect(formatMonthLabel('2026-09-08')).toBe('September 2026');
  });

  it('formats weekday and day-of-month for calendar tiles', () => {
    expect(formatWeekdayShort('2026-09-07')).toBe('Mon'); // 2026-09-07 is a Monday
    expect(formatDayOfMonth('2026-09-08')).toBe('08');
  });

  it('formats datetimes with a 12-hour clock', () => {
    expect(formatDateTime('2026-09-08T14:30:00')).toMatch(/Sep 8, 2026, 2:30 PM/);
  });
});

describe('formatDate / timeAgo', () => {
  it('formats en-US short dates', () => {
    expect(formatDate('2026-09-08')).toBe('Sep 08, 2026');
  });

  it('describes relative recency buckets without machine-specific time', () => {
    const now = new Date('2026-09-08T12:00:00');
    const clock = vi_useFakeNow(now);
    try {
      expect(timeAgo('2026-09-08T12:00:30')).toBe('Just now');
      expect(timeAgo('2026-09-08T11:30:00')).toBe('30m ago');
      expect(timeAgo('2026-09-08T06:00:00')).toBe('6h ago');
      expect(timeAgo('2026-09-05T12:00:00')).toBe('3d ago');
      expect(timeAgo('2025-09-08T12:00:00')).toBe('Sep 08, 2025');
      expect(timeAgo('garbage')).toBe('garbage'); // passthrough for bad input
    } finally {
      clock.restore();
    }
  });
});

function vi_useFakeNow(now: Date): { restore: () => void } {
  const RealDate = Date;
  // Minimal deterministic freeze: shift Date.now by the offset.
  const offset = now.getTime() - RealDate.now();
  const spy = vi.spyOn(RealDate, 'now').mockReturnValue(now.getTime());
  void offset;
  return { restore: () => spy.mockRestore() };
}

import { vi } from 'vitest';
