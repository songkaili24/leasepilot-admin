// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { addDays, toISODate } from '@/lib/dates';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';

afterEach(cleanup);

const today = toISODate(new Date());
const due = (days: number) => addDays(today, days);

describe('DaysRemainingBadge', () => {
  it('renders the day count for future dates', () => {
    render(<DaysRemainingBadge dueDate={due(10)} />);
    expect(screen.getByText('10 days')).toBeTruthy();
  });

  it('uses teal styling beyond the 90-day window', () => {
    const { container } = render(<DaysRemainingBadge dueDate={due(91)} />);
    expect(container.firstElementChild!.className).toContain('bg-teal-50');
    expect(container.firstElementChild!.className).not.toContain('animate-urgency-pulse');
  });

  it('uses amber styling in the 30-90 day window', () => {
    const { container } = render(<DaysRemainingBadge dueDate={due(45)} />);
    expect(container.firstElementChild!.className).toContain('bg-amber-50');
    expect(container.firstElementChild!.className).not.toContain('animate-urgency-pulse');
  });

  it('uses red styling and pulses inside the 30-day window', () => {
    const { container } = render(<DaysRemainingBadge dueDate={due(5)} />);
    expect(container.firstElementChild!.className).toContain('bg-red-50');
    expect(container.firstElementChild!.className).toContain('animate-urgency-pulse');
  });

  it('reports overdue days and still pulses', () => {
    const { container } = render(<DaysRemainingBadge dueDate={due(-3)} />);
    expect(screen.getByText('3d overdue')).toBeTruthy();
    // The pulse class is applied behind the motion-safe variant prefix.
    expect(
      container
        .firstElementChild!.className.split(/\s+/)
        .some((c) => c.endsWith('animate-urgency-pulse')),
    ).toBe(true);
  });

  it('labels the boundary day precisely', () => {
    render(<DaysRemainingBadge dueDate={due(0)} />);
    expect(screen.getByText('Due today')).toBeTruthy();
    render(<DaysRemainingBadge dueDate={due(1)} />);
    expect(screen.getByText('1 day')).toBeTruthy();
  });

  it('can suppress the pulse for dense contexts', () => {
    const { container } = render(<DaysRemainingBadge dueDate={due(5)} pulse={false} />);
    expect(container.firstElementChild!.className).not.toContain('animate-urgency-pulse');
  });
});
