'use client';

import { Badge } from '@/components/ui/Badge';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';
import { categoryBadgeTone, categoryDotClass, categoryForDateType } from '@/lib/calendar';
import { formatDate, formatRelativeDue } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { UpcomingDate } from '@/lib/search';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';

/** Sidebar list of every filtered critical date in the displayed month. */
export function MonthDateList({
  monthDates,
  monthCursor,
  todayISO,
}: {
  monthDates: UpcomingDate[];
  monthCursor: Date;
  todayISO: string;
}) {
  return (
    <section aria-label="All dates in month" className={cardClasses}>
      <header className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy-900">
          {monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} dates
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          All filtered events in the selected month, soonest first.
        </p>
      </header>
      {monthDates.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500">
          No events this month under the current filters.
        </p>
      ) : (
        <ol role="list" className="divide-y divide-slate-100">
          {monthDates.map((date) => (
            <li key={date.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs font-semibold tabular-nums text-navy-900">
                  {formatDate(date.dueDate)}
                </p>
                <DaysRemainingBadge dueDate={date.dueDate} today={todayISO} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone={categoryBadgeTone[categoryForDateType(date.type)]}>
                  <span
                    aria-hidden
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      categoryDotClass[categoryForDateType(date.type)],
                    )}
                  />
                  {categoryForDateType(date.type)}
                </Badge>
                <span className="text-sm font-medium text-navy-900">{date.tenantName}</span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {date.leaseNumber}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {formatRelativeDue(date.dueDate)} · {date.type}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
