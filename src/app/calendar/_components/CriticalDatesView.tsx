'use client';

import { useMemo, useState } from 'react';
import { EmptyState, StatCard, Timeline } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { allUpcomingDates } from '@/lib/search';
import { severityFor } from '@/lib/alerts';
import { addDays, diffInDays, formatDate, formatRelativeDue, toISODate } from '@/lib/dates';
import { MonthCalendar } from './MonthCalendar';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';

const RANGE_PRESETS = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1yr', days: 365 },
] as const;

export function CriticalDatesView() {
  const all = useMemo(() => allUpcomingDates(), []);
  const todayISO = toISODate(new Date());

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({
    start: addDays(todayISO, -30),
    end: addDays(todayISO, 120),
  });
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(todayISO);

  const filtered = useMemo(() => {
    return all.filter((date) => {
      if (typeFilter !== 'all' && date.type !== typeFilter) return false;
      if (range.start && date.dueDate < range.start) return false;
      if (range.end && date.dueDate > range.end) return false;
      return true;
    });
  }, [all, typeFilter, range]);

  const overdueCount = filtered.filter((d) => d.dueDate < todayISO).length;
  const next30Count = filtered.filter(
    (d) => d.dueDate >= todayISO && diffInDays(todayISO, d.dueDate) <= 30,
  ).length;
  const next90Count = filtered.filter(
    (d) => d.dueDate >= todayISO && diffInDays(todayISO, d.dueDate) <= 90,
  ).length;

  const typeOptions = Array.from(new Set(all.map((d) => d.type))).sort();

  return (
    <>
      <PageHeader
        title="Critical Dates Calendar"
        description="Contractual deadlines that trigger notice obligations, adjustments, or payment events."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          subvalue="Immediate action required"
          hint="Critical dates whose due date has passed without resolution."
        />
        <StatCard
          label="Due within 30 days"
          value={String(next30Count)}
          subvalue="Red window"
          hint="Deadlines inside the 30-day escalation window."
        />
        <StatCard
          label="Due within 90 days"
          value={String(next90Count)}
          subvalue="Amber window — begin preparation"
          hint="Deadlines inside the 90-day planning window."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section
          className={`${cardClasses} overflow-hidden xl:col-span-3`}
          aria-label="Month calendar"
        >
          <MonthCalendar
            dates={filtered}
            monthCursor={monthCursor}
            onMonthChange={setMonthCursor}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />
        </section>

        <section className={cardClasses} aria-label="Chronological critical dates">
          <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-navy-900">Upcoming &amp; overdue queue</h2>
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Filter by date type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <option value="all">All date types</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="flex overflow-hidden rounded-md border border-slate-300">
                {RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setRange({ start: todayISO, end: addDays(todayISO, preset.days) })
                    }
                    className="border-r border-slate-300 bg-white px-2.5 py-1 font-mono text-xs tabular-nums text-slate-600 transition-colors last:border-r-0 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRange({ start: null, end: null })}
                  className="bg-white px-2.5 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  All
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {range.start && range.end
                ? `Window: ${formatDate(range.start)} – ${formatDate(range.end)}`
                : 'Showing all dates in the dataset.'}
            </p>
          </header>
          <div className="max-h-[36rem] overflow-y-auto px-4 py-4">
            {filtered.length === 0 ? (
              <EmptyState
                title="No dates in this window"
                description="Widen the filter window or clear the date type filter."
              />
            ) : (
              <Timeline
                items={filtered.slice(0, 18).map((date) => ({
                  id: date.id,
                  date: date.dueDate,
                  title: date.type,
                  meta: `${date.tenantName} · ${date.leaseNumber} · ${formatRelativeDue(date.dueDate)}`,
                  tone:
                    severityFor(date.dueDate) === 'red'
                      ? 'red'
                      : severityFor(date.dueDate) === 'amber'
                        ? 'amber'
                        : 'slate',
                }))}
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
