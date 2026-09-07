import type { ReactNode } from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';

export type StatTrend = 'up' | 'down' | 'flat';

const trendClasses: Record<StatTrend, string> = {
  up: 'text-teal-700',
  down: 'text-red-700',
  flat: 'text-slate-500',
};

const trendIcons: Record<StatTrend, ReactNode> = {
  up: <TrendingUp className="h-3.5 w-3.5" aria-hidden />,
  down: <TrendingDown className="h-3.5 w-3.5" aria-hidden />,
  flat: <Minus className="h-3.5 w-3.5" aria-hidden />,
};

export function StatCard({
  label,
  value,
  subvalue,
  hint,
  trend,
  trendLabel,
  className,
}: {
  label: string;
  /** Pre-formatted figure — rendered in IBM Plex Mono with tabular numerals. */
  value: string;
  subvalue?: string;
  /** Optional definition shown in a tooltip beside the label. */
  hint?: string;
  trend?: StatTrend;
  trendLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border border-slate-200 bg-white p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {hint ? (
          <Tooltip content={hint}>
            <span
              tabIndex={-1}
              aria-label={`About ${label}`}
              className="text-slate-400 transition-colors hover:text-slate-600"
            >
              <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Tooltip>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-navy-900">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              trendClasses[trend],
            )}
          >
            {trendIcons[trend]}
            {trendLabel}
          </span>
        ) : null}
        {subvalue ? <p className="text-xs text-slate-500">{subvalue}</p> : null}
      </div>
    </div>
  );
}
