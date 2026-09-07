import { Skeleton } from '@/components/ui/Skeleton';

const tabs = ['Overview', 'Critical Dates', 'Financial Obligations', 'Documents', 'Notes'];

/** Skeleton placeholder shown while lease detail tab content loads. */
export function LeaseTabSkeleton({ label }: { label?: string }) {
  return (
    <div role="status" aria-label={`Loading ${label ?? 'tab'} content`} className="space-y-4">
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <div key={tab} className="px-3 py-2">
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
