'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { severityFor } from '@/lib/alerts';
import {
  addDays,
  formatDayOfMonth,
  formatDate,
  formatWeekdayShort,
  isSameMonth,
  toISODate,
} from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { UpcomingDate } from '@/lib/search';

const severityDot = { red: 'bg-red-600', amber: 'bg-amber-500', ok: 'bg-teal-600' } as const;
const severityTone = { red: 'red', amber: 'amber', ok: 'teal' } as const;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Month grid with per-day critical-date markers and a selected-day detail strip. */
export function MonthCalendar({
  dates,
  monthCursor,
  onMonthChange,
  selectedDay,
  onSelectDay,
}: {
  dates: UpcomingDate[];
  monthCursor: Date;
  onMonthChange: (next: Date) => void;
  selectedDay: string | null;
  onSelectDay: (iso: string) => void;
}) {
  const todayISO = toISODate(new Date());
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const gridStart = addDays(toISODate(first), -first.getDay());
  const gridDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const byDay = new Map<string, UpcomingDate[]>();
  for (const date of dates) {
    const bucket = byDay.get(date.dueDate) ?? [];
    bucket.push(date);
    byDay.set(date.dueDate, bucket);
  }

  const selectedDates = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const selectedIsCurrentMonth = selectedDay ? isSameMonth(selectedDay, monthCursor) : false;

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy-900" aria-live="polite">
          {monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
            }
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onMonthChange(new Date());
              onSelectDay(todayISO);
            }}
          >
            Today
          </Button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              onMonthChange(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
            }
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {gridDays.map((dayISO) => {
          const dayDates = byDay.get(dayISO) ?? [];
          const inMonth = isSameMonth(dayISO, monthCursor);
          const isToday = dayISO === todayISO;
          const worstSeverity = dayDates.reduce<'red' | 'amber' | 'ok'>((worst, d) => {
            const s = severityFor(d.dueDate);
            return s === 'red' ? 'red' : s === 'amber' && worst !== 'red' ? 'amber' : worst;
          }, 'ok');
          const isSelected = dayISO === selectedDay;
          return (
            <button
              key={dayISO}
              type="button"
              onClick={() => onSelectDay(dayISO)}
              aria-pressed={isSelected}
              className={cn(
                'relative min-h-[4.25rem] border-b border-r border-slate-100 p-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700',
                isSelected
                  ? 'bg-teal-50'
                  : inMonth
                    ? 'hover:bg-slate-50'
                    : 'bg-slate-50/40 hover:bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[11px] font-medium tabular-nums',
                  isToday ? 'bg-navy-800 text-white' : inMonth ? 'text-navy-900' : 'text-slate-300',
                )}
              >
                {formatDayOfMonth(dayISO)}
              </span>
              {dayDates.length > 0 ? (
                <span className="mt-1 flex flex-wrap items-center gap-0.5">
                  <span
                    aria-hidden
                    className={cn('h-1.5 w-1.5 rounded-full', severityDot[worstSeverity])}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      inMonth ? 'text-slate-600' : 'text-slate-400',
                    )}
                  >
                    {dayDates.length} date{dayDates.length === 1 ? '' : 's'}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="min-h-[7.5rem] px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {selectedDay
            ? `${formatWeekdayShort(selectedDay)}, ${formatDate(selectedDay)}`
            : 'Select a day'}
          {!selectedIsCurrentMonth && selectedDay ? (
            <span className="ml-1.5 font-normal normal-case text-slate-400">
              (outside displayed month)
            </span>
          ) : null}
        </h3>
        {selectedDates.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No critical dates fall on this day.</p>
        ) : (
          <ul role="list" className="mt-2 space-y-2">
            {selectedDates.map((date) => (
              <li key={date.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Badge tone={severityTone[severityFor(date.dueDate)]}>{date.type}</Badge>
                <span className="font-medium text-navy-900">{date.tenantName}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {date.leaseNumber}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
