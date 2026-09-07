import { Badge, type BadgeTone } from './Badge';
import { diffInDays, toISODate } from '@/lib/dates';

/**
 * Days-remaining indicator with urgency coloring:
 * teal/green > 90 days · amber 30–90 · red < 30 or overdue.
 */
export function DaysRemainingBadge({ dueDate, today }: { dueDate: string; today?: string }) {
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
  return <Badge tone={tone}>{label}</Badge>;
}
