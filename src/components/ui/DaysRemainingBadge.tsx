import { Badge, type BadgeTone } from './Badge';
import { cn } from '@/lib/utils';
import { diffInDays, toISODate } from '@/lib/dates';

/**
 * Days-remaining indicator with urgency coloring:
 * teal/green > 90 days · amber 30–90 · red < 30 or overdue.
 * Red-window badges carry a soft urgency pulse (static under reduced motion).
 */
export function DaysRemainingBadge({
  dueDate,
  today,
  pulse = true,
}: {
  dueDate: string;
  today?: string;
  /** Disable the pulse in dense contexts where several badges pulse together. */
  pulse?: boolean;
}) {
  const now = today ?? toISODate(new Date());
  const days = diffInDays(now, dueDate);
  const tone: BadgeTone = days <= 30 ? 'red' : days <= 90 ? 'amber' : 'teal';
  const label =
    days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? 'Due today'
        : days === 1
          ? '1 day'
          : `${days} days`;
  const urgent = tone === 'red' && pulse;
  return (
    <Badge
      tone={tone}
      className={cn(
        urgent &&
          'motion-safe:animate-urgency-pulse motion-reduce:ring-2 motion-reduce:ring-red-300',
      )}
    >
      {label}
    </Badge>
  );
}
