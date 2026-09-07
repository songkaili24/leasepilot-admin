'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { parseISODate, toISODate } from '@/lib/dates';
import { cn } from '@/lib/utils';

export const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export interface DayCell {
  iso: string;
  inMonth: boolean;
}

/** Builds a fixed 6-week (42-cell) Sunday-start grid for the given month. */
export function buildMonthCells(monthRef: Date): DayCell[] {
  const first = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay()); // backfill to Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { iso: toISODate(d), inMonth: d.getMonth() === monthRef.getMonth() };
  });
}

export interface MonthGridProps {
  monthRef: Date;
  onMonthChange: (next: Date) => void;
  selected: string | null;
  rangeStart: string | null;
  /** Inclusive range end; when null and hovering, the hover date previews the end. */
  rangeEnd: string | null;
  hoverDate: string | null;
  onHover: (iso: string | null) => void;
  onSelect: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
}

/** Month calendar grid shared by the single date and range pickers. */
export function MonthGrid({
  monthRef,
  onMonthChange,
  selected,
  rangeStart,
  rangeEnd,
  hoverDate,
  onHover,
  onSelect,
  minDate,
  maxDate,
}: MonthGridProps) {
  const cells = buildMonthCells(monthRef);
  const monthLabel = monthRef.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const effectiveEnd =
    rangeEnd ?? (rangeStart && hoverDate && hoverDate >= rangeStart ? hoverDate : null);

  function inRange(iso: string): boolean {
    if (rangeStart && effectiveEnd) return iso >= rangeStart && iso <= effectiveEnd;
    return false;
  }

  function disabled(iso: string): boolean {
    return Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate));
  }

  return (
    <div className="w-64 rounded-md border border-slate-200 bg-white p-3 shadow-popover">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() =>
            onMonthChange(new Date(monthRef.getFullYear(), monthRef.getMonth() - 1, 1))
          }
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy-800"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <p className="text-sm font-semibold text-navy-900" aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            onMonthChange(new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 1))
          }
          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy-800"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {WEEKDAY_HEADERS.map((d) => (
              <th
                key={d}
                scope="col"
                className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {cells.slice(week * 7, week * 7 + 7).map((cell) => {
                const isSelected = cell.iso === selected;
                const isRangeStart = cell.iso === rangeStart;
                const isRangeEnd = cell.iso === effectiveEnd;
                const isInside = inRange(cell.iso);
                return (
                  <td key={cell.iso} className="p-0 text-center">
                    <button
                      type="button"
                      disabled={disabled(cell.iso)}
                      onClick={() => onSelect(cell.iso)}
                      onMouseEnter={() => onHover(cell.iso)}
                      onFocus={() => onHover(cell.iso)}
                      aria-pressed={isSelected || isRangeStart || isRangeEnd}
                      aria-current={isSelected ? 'date' : undefined}
                      className={cn(
                        'h-7 w-8 rounded font-mono text-xs tabular-nums transition-colors disabled:cursor-not-allowed disabled:text-slate-300',
                        isInside && !isRangeStart && !isRangeEnd && 'bg-teal-50 text-navy-900',
                        (isRangeStart || isRangeEnd || isSelected) &&
                          'bg-teal-700 font-semibold text-white hover:bg-teal-800',
                        !isInside &&
                          !isSelected &&
                          !isRangeStart &&
                          !isRangeEnd &&
                          'text-navy-800 hover:bg-slate-100',
                        !cell.inMonth && 'text-slate-300',
                      )}
                    >
                      {parseISODate(cell.iso).getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
