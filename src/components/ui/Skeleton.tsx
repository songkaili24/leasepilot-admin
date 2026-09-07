import { cn } from '@/lib/utils';

/** Pulse animation placeholder. Set explicit dimensions via className. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded bg-slate-200/80', className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          // Last line renders short so the block reads as text, not a bar chart.
          className={cn('h-3', i === lines - 1 ? 'w-2/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-6 w-28" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-slate-100">
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        {['w-32', 'w-48', 'w-24', 'w-28', 'w-20'].map((w) => (
          <Skeleton key={w} className={cn('h-3', w)} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}
