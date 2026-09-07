import { addDays } from './dates';

/** Minimal RFC 5545 calendar export for critical-date feeds. */

export interface ICalEvent {
  uid: string;
  /** ISO date (all-day event). */
  date: string;
  summary: string;
  description?: string;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function icsDate(iso: string): string {
  return iso.replaceAll('-', '');
}

function icsStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

export function buildICalendar(events: ICalEvent[], calendarName: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LeaseVault Commercial//Critical Dates//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calendarName)}`,
  ];
  const stamp = icsStamp();
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(event.uid)}@leasevault.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
      `DTEND;VALUE=DATE:${icsDate(addDays(event.date, 1))}`,
      `SUMMARY:${icsEscape(event.summary)}`,
      `DESCRIPTION:${icsEscape(event.description ?? '')}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
