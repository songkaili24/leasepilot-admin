'use client';

import { Badge } from '@/components/ui/Badge';
import {
  categoryBadgeTone,
  categoryDotClass,
  categoryForDateType,
  type DateCategory,
} from '@/lib/calendar';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';
import {
  formatDayOfMonth,
  formatDate,
  formatWeekdayShort,
  isSameMonth,
  toISODate,
} from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { UpcomingDate } from '@/lib/search';

const severityDot = { red: 'bg-red-600', amber: 'bg-amber-500', ok: 'bg-teal-600' } as const;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface MonthCalendarProps {
  dates: UpcomingDate[];
  monthCursor: Date;
  onMonthChange: (next: Date) => void;
  selectedDay: string | null;
  onSelectDay: (iso: string) => void;
  onExportICal: () => void;
}

function shiftMonth(cursor: Date, delta: number): Date {
  return new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
}

/** Month grid with category-colored event dots and a selected-day detail panel. */
export function MonthCalendar({
  dates,
  monthCursor,
  onMonthChange,
  selectedDay,
  onSelectDay,
  onExportICal,
}: MonthCalendarProps) {
  const todayISO = toISODate(new Date());
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay());
  const gridDays: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    gridDays.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }

  const byDay = new Map<string, UpcomingDate[]>();
  for (const date of dates) {
    const bucket = byDay.get(date.dueDate) ?? [];
    bucket.push(date);
    byDay.set(date.dueDate, bucket);
  }

  const selectedDates = selectedDay ? (byDay.get(selectedDay) ?? []) : [];
  const monthDates = dates.filter((d) => isSameMonth(d.dueDate, monthCursor));
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy-900" aria-live="polite">
          {monthLabel}
          <span className="ml-2 font-mono text-xs font-normal tabular-nums text-slate-400">
            {monthDates.length} event{monthDates.length === 1 ? '' : 's'}
          </span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label={`Previous month`}
            onClick={() => onMonthChange(shiftMonth(monthCursor, -1))}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              onMonthChange(new Date());
              onSelectDay(todayISO);
            }}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-navy-800 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            Today
          </button>
          <button
            type="button"
            aria-label={`Next month`}
            onClick={() => onMonthChange(shiftMonth(monthCursor, 1))}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            ›
          </button>
          <button
            type="button"
            onClick={onExportICal}
            className="ml-1.5 rounded-md bg-teal-700 px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Export .ics
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

      <div className="grid flex-1 grid-cols-7">
        {gridDays.map((dayISO) => {
          const dayDates = byDay.get(dayISO) ?? [];
          const inMonth = isSameMonth(dayISO, monthCursor);
          const isToday = dayISO === todayISO;
          const isSelected = dayISO === selectedDay;
          const categories = Array.from(new Set(dayDates.map((d) => categoryForDateType(d.type))));
          return (
            <button
              key={dayISO}
              type="button"
              onClick={() => onSelectDay(dayISO)}
              aria-pressed={isSelected}
              aria-label={`${formatDate(dayISO)}, ${dayDates.length} event${dayDates.length === 1 ? '' : 's'}`}
              className={cn(
                'min-h-[4.5rem] border-b border-r border-slate-100 p-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700',
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
              {categories.length > 0 ? (
                <span className="mt-1 flex flex-wrap gap-1" aria-hidden>
                  {categories.slice(0, 4).map((category) => (
                    <span
                      key={category}
                      className={cn('h-1.5 w-1.5 rounded-full', categoryDotClass[category])}
                    />
                  ))}
                </span>
              ) : null}
              {dayDates.length > 2 ? (
                <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                  {dayDates.length} events
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Selected-day detail panel */}
      <div className="min-h-[8rem] border-t border-slate-200 px-4 py-3" aria-live="polite">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {selectedDay
            ? `${formatWeekdayShort(selectedDay)}, ${formatDate(selectedDay)}`
            : 'Select a day'}
        </h3>
        {selectedDates.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No critical dates fall on this day.</p>
        ) : (
          <ul role="list" className="mt-2 space-y-2.5">
            {selectedDates.map((date) => (
              <li key={date.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Badge tone={categoryBadgeTone[categoryForDateType(date.type)]}>
                  {categoryForDateType(date.type)}
                </Badge>
                <span className="font-medium text-navy-900">{date.tenantName}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {date.leaseNumber}
                </span>
                <span className="ml-auto">
                  <DaysRemainingBadge dueDate={date.dueDate} today={todayISO} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Re-exported for the sidebar legend.
export { severityDot };
