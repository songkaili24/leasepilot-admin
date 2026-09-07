import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'navy' | 'teal' | 'amber' | 'red' | 'slate';

const toneClasses: Record<BadgeTone, string> = {
  navy: 'bg-navy-100 text-navy-800 ring-navy-200',
  teal: 'bg-teal-50 text-teal-800 ring-teal-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-800 ring-red-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const dotClasses: Record<BadgeTone, string> = {
  navy: 'bg-navy-600',
  teal: 'bg-teal-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
  slate: 'bg-slate-400',
};

export type LeaseStatusBadgeStatus = 'Active' | 'Expiring' | 'Renewed' | 'Terminated';

const leaseStatusTone: Record<LeaseStatusBadgeStatus, BadgeTone> = {
  Active: 'teal',
  Expiring: 'amber',
  Renewed: 'navy',
  Terminated: 'red',
};

export function Badge({
  tone = 'slate',
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  /** Renders a leading status dot in the badge tone. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
    >
      {dot ? (
        <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} />
      ) : null}
      {children}
    </span>
  );
}

/** Canonical status → badge mapping for lease records. */
export function LeaseStatusBadge({ status }: { status: LeaseStatusBadgeStatus }) {
  return (
    <Badge tone={leaseStatusTone[status]} dot>
      {status}
    </Badge>
  );
}
