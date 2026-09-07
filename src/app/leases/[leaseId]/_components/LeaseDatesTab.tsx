import { Timeline } from '@/components/ui/Timeline';
import { Badge } from '@/components/ui/Badge';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';
import { categoryBadgeTone, categoryForDateType } from '@/lib/calendar';
import { criticalDatesForLease } from '@/lib/data';
import { toISODate } from '@/lib/dates';
import type { Lease } from '@/lib/types';

/** Critical Dates tab: full milestone timeline with countdown badges. */
export function LeaseDatesTab({ lease }: { lease: Lease }) {
  const today = toISODate(new Date());
  const dates = criticalDatesForLease(lease.id);

  if (dates.length === 0) {
    return <p className="text-sm text-slate-500">No critical dates abstracted for this lease.</p>;
  }

  return (
    <Timeline
      items={dates.map((date) => ({
        id: date.id,
        date: date.dueDate,
        title: date.type,
        meta: date.notes,
        tone:
          date.dueDate < today
            ? 'red'
            : date.type === 'Rent Escalation'
              ? 'teal'
              : date.type === 'Renewal Option' || date.type === 'Expiration'
                ? 'navy'
                : 'amber',
        action: (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={categoryBadgeTone[categoryForDateType(date.type)]}>
              {categoryForDateType(date.type)}
            </Badge>
            <DaysRemainingBadge dueDate={date.dueDate} today={today} />
          </div>
        ),
      }))}
    />
  );
}
