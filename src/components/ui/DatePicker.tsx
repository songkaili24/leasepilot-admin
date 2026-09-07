'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { formatDate, parseISODate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { MonthGrid } from './MonthGrid';

/** Behavior shared by both pickers: outside-click and Escape dismissal. */
function usePickerDismiss(
  open: boolean,
  rootRef: React.RefObject<HTMLDivElement>,
  close: () => void,
) {
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, rootRef, close]);
}

/** Single date picker with keyboard-accessible grid and optional min/max bounds. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  ariaLabel = 'Select date',
  className,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [monthRef, setMonthRef] = useState(() => (value ? parseISODate(value) : new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  usePickerDismiss(open, rootRef, () => setOpen(false));

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 w-full items-center gap-2 rounded-md border bg-white px-3 text-sm transition-colors',
          'border-slate-300 text-left hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
          !value && 'text-slate-400',
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span className="font-mono tabular-nums">{value ? formatDate(value) : placeholder}</span>
      </button>
      {open ? (
        <div id={listId} className="absolute left-0 top-full z-30 mt-1">
          <MonthGrid
            monthRef={monthRef}
            onMonthChange={setMonthRef}
            selected={value}
            rangeStart={null}
            rangeEnd={null}
            hoverDate={null}
            onHover={() => {}}
            onSelect={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Range picker built on the same grid; first click sets the start, second the end. */
export function DateRangePicker({
  value,
  onChange,
  ariaLabel = 'Select date range',
  className,
}: {
  value: { start: string | null; end: string | null };
  onChange: (next: { start: string | null; end: string | null }) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [monthRef, setMonthRef] = useState(() =>
    value.start ? parseISODate(value.start) : new Date(),
  );
  const [pendingStart, setPendingStart] = useState<string | null>(value.start);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  usePickerDismiss(open, rootRef, () => setOpen(false));

  const label =
    value.start && value.end
      ? `${formatDate(value.start)} – ${formatDate(value.end)}`
      : value.start
        ? `${formatDate(value.start)} – …`
        : 'All dates';

  function handleSelect(iso: string) {
    if (!pendingStart || (pendingStart && value.end)) {
      setPendingStart(iso);
      onChange({ start: iso, end: null });
      return;
    }
    if (iso < pendingStart) {
      onChange({ start: iso, end: pendingStart });
    } else {
      onChange({ start: pendingStart, end: iso });
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 transition-colors',
          'hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
        )}
      >
        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
        <span className="font-mono tabular-nums">{label}</span>
      </button>
      {open ? (
        <div id={listId} className="absolute left-0 top-full z-30 mt-1">
          <MonthGrid
            monthRef={monthRef}
            onMonthChange={setMonthRef}
            selected={null}
            rangeStart={value.start}
            rangeEnd={value.end}
            hoverDate={hoverDate}
            onHover={setHoverDate}
            onSelect={handleSelect}
          />
        </div>
      ) : null}
    </div>
  );
}
