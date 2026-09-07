'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { properties } from '@/lib/data';
import { DATE_CATEGORIES, categoryForDateType, type DateCategory } from '@/lib/calendar';
import { downloadTextFile } from '@/lib/csv';
import { buildICalendar } from '@/lib/ical';
import { diffInDays, toISODate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { UpcomingDate } from '@/lib/search';
import { MonthCalendar } from './MonthCalendar';
import { MonthDateList } from './MonthDateList';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';
const selectClasses =
  'h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700';

export function CriticalDatesView({ allDates }: { allDates: UpcomingDate[] }) {
  const todayISO = toISODate(new Date());
  const [categoryFilter, setCategoryFilter] = useState<DateCategory | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(todayISO);

  const filtered = useMemo(
    () =>
      allDates.filter((date) => {
        if (categoryFilter !== 'all' && categoryForDateType(date.type) !== categoryFilter) {
          return false;
        }
        if (propertyFilter !== 'all' && date.propertyId !== propertyFilter) return false;
        return true;
      }),
    [allDates, categoryFilter, propertyFilter],
  );

  const monthDates = useMemo(
    () =>
      filtered
        .filter((d) => d.dueDate.startsWith(monthKey(monthCursor)))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [filtered, monthCursor],
  );

  const within90 = filtered.filter((d) => {
    const days = diffInDays(todayISO, d.dueDate);
    return days >= 0 && days <= 90;
  }).length;
  const overdue = filtered.filter((d) => d.dueDate < todayISO).length;

  function exportICal() {
    const ics = buildICalendar(
      filtered.map((date) => ({
        uid: date.id,
        date: date.dueDate,
        summary: `${date.type}: ${date.tenantName} (${date.leaseNumber})`,
        description: date.notes,
      })),
      'LeaseVault — Critical Dates',
    );
    downloadTextFile('leasevault-critical-dates.ics', ics, 'text/calendar;charset=utf-8');
  }

  return (
    <>
      <PageHeader
        title="Critical Dates Calendar"
        description="Contractual deadlines that trigger notice obligations, adjustments, or payment events."
        actions={
          <button
            type="button"
            onClick={exportICal}
            className="inline-flex h-9 items-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Export calendar to iCal
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <section className={cn(cardClasses, 'overflow-hidden')} aria-label="Month calendar">
          <MonthCalendar
            dates={filtered}
            monthCursor={monthCursor}
            onMonthChange={setMonthCursor}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onExportICal={exportICal}
          />
        </section>

        <div className="space-y-4">
          <section aria-label="Calendar filters" className={cn(cardClasses, 'p-4')}>
            <h2 className="text-sm font-semibold text-navy-900">Filters</h2>
            <div className="mt-3 space-y-3">
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Event type
                </legend>
                <select
                  aria-label="Filter by event type"
                  className={`${selectClasses} mt-1.5 w-full`}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as DateCategory | 'all')}
                >
                  <option value="all">All event types</option>
                  {DATE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </fieldset>
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Property
                </legend>
                <select
                  aria-label="Filter by property"
                  className={`${selectClasses} mt-1.5 w-full`}
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                >
                  <option value="all">All properties</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </fieldset>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>
                  Overdue{' '}
                  <span className="font-mono font-semibold tabular-nums text-red-700">
                    {overdue}
                  </span>
                </span>
                <span>
                  Next 90 days{' '}
                  <span className="font-mono font-semibold tabular-nums text-amber-600">
                    {within90}
                  </span>
                </span>
                <span>
                  Matching{' '}
                  <span className="font-mono font-semibold tabular-nums text-navy-900">
                    {filtered.length}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <MonthDateList monthDates={monthDates} monthCursor={monthCursor} todayISO={todayISO} />
        </div>
      </div>
    </>
  );
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
