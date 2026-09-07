import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeDue } from '@/lib/dates';

export type TimelineTone = 'red' | 'amber' | 'teal' | 'navy' | 'slate';

export interface TimelineItem {
  id: string;
  /** ISO date — rendered as `<time dateTime>` and drives the tone if not explicit. */
  date: string;
  title: string;
  meta?: string;
  tone?: TimelineTone;
  action?: ReactNode;
}

const dotClasses: Record<TimelineTone, string> = {
  red: 'bg-red-600',
  amber: 'bg-amber-500',
  teal: 'bg-teal-600',
  navy: 'bg-navy-600',
  slate: 'bg-slate-300',
};

/**
 * Vertical critical-date timeline. The most urgent items sort first upstream;
 * tone defaults derive from proximity to today.
 */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <ol role="list" className={cn('relative space-y-5 border-l border-slate-200 pl-6', className)}>
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            aria-hidden
            className={cn(
              'absolute -left-[1.72rem] top-1 h-3 w-3 rounded-full ring-4 ring-white',
              dotClasses[item.tone ?? 'slate'],
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <time
              dateTime={item.date}
              className="font-mono text-xs font-medium tabular-nums text-slate-500"
            >
              {formatDate(item.date)}
            </time>
            <span className="text-xs text-slate-400">{formatRelativeDue(item.date)}</span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-navy-900">{item.title}</p>
          {item.meta ? (
            <p className="mt-0.5 text-xs leading-snug text-slate-500">{item.meta}</p>
          ) : null}
          {item.action ? <div className="mt-1.5">{item.action}</div> : null}
        </li>
      ))}
    </ol>
  );
}
