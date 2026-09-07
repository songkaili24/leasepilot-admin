// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <div>overview content</div> },
  { id: 'dates', label: 'Critical Dates', count: 3, content: <div>dates content</div> },
];

describe('Tabs (lease document sections)', () => {
  it('shows the first tab by default and hides the rest', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('overview content')).toBeTruthy();
    expect(screen.queryByText('dates content')).toBeNull();
    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches panels on click and updates aria state', () => {
    render(<Tabs items={items} />);
    fireEvent.click(screen.getByRole('tab', { name: /Critical Dates/ }));
    expect(screen.getByText('dates content')).toBeTruthy();
    expect(screen.queryByText('overview content')).toBeNull();
    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'false');
  });

  it('implements the roving tabindex pattern', () => {
    render(<Tabs items={items} />);
    const overview = screen.getByRole('tab', { name: /Overview/ });
    const dates = screen.getByRole('tab', { name: /Critical Dates/ });
    expect(overview).toHaveAttribute('tabindex', '0');
    expect(dates).toHaveAttribute('tabindex', '-1');
    fireEvent.click(dates);
    expect(dates).toHaveAttribute('tabindex', '0');
    expect(overview).toHaveAttribute('tabindex', '-1');
  });

  it('navigates with arrow keys, Home, and End', () => {
    render(<Tabs items={items} />);
    const overview = screen.getByRole('tab', { name: /Overview/ });
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Critical Dates/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /Critical Dates/ }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(screen.getByRole('tab', { name: /Overview/ }), { key: 'End' });
    expect(screen.getByRole('tab', { name: /Critical Dates/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('shows a skeleton while switching, then the panel (aria-busy contract)', () => {
    vi.useFakeTimers();
    render(<Tabs items={items} switchSkeletonMs={150} />);
    fireEvent.click(screen.getByRole('tab', { name: /Critical Dates/ }));

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('dates content')).toBeNull();
    expect(screen.queryByText('overview content')).toBeNull(); // old panel gone

    act(() => {
      vi.advanceTimersByTime(200);
    });
    // React omits aria-busy when the value is false — absence is the loaded signal.
    expect(panel).not.toHaveAttribute('aria-busy');
    expect(screen.getByText('dates content')).toBeTruthy();
  });

  it('announces tab changes to assistive tech', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText(/Overview tab shown/)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: /Critical Dates/ }));
    expect(screen.getByText(/Critical Dates tab shown/)).toBeTruthy();
  });

  it('does not enter the loading state when re-selecting the active tab', () => {
    vi.useFakeTimers();
    render(<Tabs items={items} switchSkeletonMs={150} />);
    fireEvent.click(screen.getByRole('tab', { name: /Overview/ }));
    expect(screen.getByText('overview content')).toBeTruthy();
    expect(screen.queryByText(/Loading/)).toBeNull();
  });
});
