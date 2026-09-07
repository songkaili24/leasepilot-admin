import { describe, expect, it } from 'vitest';
import { buildICalendar, type ICalEvent } from '@/lib/ical';

const events: ICalEvent[] = [
  {
    uid: 'cd-l-1-0',
    date: '2026-09-30',
    summary: 'Expiration: Craftwork Coffee Roasters (LV-2023-0544)',
    description: 'Primary term expires; 150% holdover applies.',
  },
  { uid: 'cd-l-2-0', date: '2026-12-15', summary: 'Notice: Dunmore Clinical Labs' },
];

describe('buildICalendar', () => {
  const ics = buildICalendar(events, 'LeaseVault — Critical Dates');

  it('emits a VCALENDAR envelope with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('CALSCALE:GREGORIAN');
    expect(ics).not.toMatch(/[^\r]\n/); // no bare LF
  });

  it('emits all-day VEVENTs with DTEND on the following day', () => {
    expect(ics).toContain('UID:cd-l-1-0@leasevault.com');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260930');
    expect(ics).toContain('DTEND;VALUE=DATE:20261001');
    expect(ics).toContain('SUMMARY:Expiration: Craftwork Coffee Roasters (LV-2023-0544)');
  });

  it('escapes RFC 5545 special characters in text fields', () => {
    const tricky = buildICalendar(
      [{ uid: 'x', date: '2026-01-01', summary: 'A, B; C\\D', description: 'line1\nline2' }],
      'cal',
    );
    expect(tricky).toContain('SUMMARY:A\\, B\\; C\\\\D');
    expect(tricky).toContain('DESCRIPTION:line1\\nline2');
  });

  it('produces a valid empty calendar', () => {
    const empty = buildICalendar([], 'cal');
    expect(empty).toContain('X-WR-CALNAME:cal');
    expect(empty).not.toContain('BEGIN:VEVENT');
  });

  it('handles month/year rollover for DTEND', () => {
    const rollover = buildICalendar([{ uid: 'y', date: '2026-12-31', summary: 's' }], 'cal');
    expect(rollover).toContain('DTEND;VALUE=DATE:20270101');
  });
});
