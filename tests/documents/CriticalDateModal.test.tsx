// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CriticalDateModal } from '@/components/documents/CriticalDateModal';

afterEach(cleanup);

const EXPIRATION = '2029-09-30';
function renderOpen(onClose = vi.fn()) {
  render(
    <CriticalDateModal
      open
      onClose={onClose}
      leaseNumber="LV-2021-0231"
      expirationDate={EXPIRATION}
    />,
  );
  const form = document.querySelector('#critical-date-form') as HTMLFormElement;
  const type = document.querySelector('#cd-type') as HTMLSelectElement;
  return { onClose, form, type };
}

function dateTriggers(): HTMLButtonElement[] {
  return screen
    .getAllByRole('button')
    .filter((b): b is HTMLButtonElement => b.getAttribute('aria-haspopup') === 'dialog');
}

/**
 * Picks a day in the picker at `pickerIndex` after moving `monthDelta` months
 * from the displayed month. The grid shows one month at a time; navigation
 * buttons are aria-labelled 'Previous month' / 'Next month'.
 */
function pickDay(pickerIndex: number, monthDelta: number, day: number) {
  fireEvent.click(dateTriggers()[pickerIndex]);
  const nav = monthDelta >= 0 ? 'Next month' : 'Previous month';
  for (let i = 0; i < Math.abs(monthDelta); i++) {
    fireEvent.click(screen.getByRole('button', { name: nav }));
  }
  fireEvent.click(
    screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('font-mono') && b.textContent === String(day))[0],
  );
}

const duePast = () => pickDay(0, -1, 15); // 15th of last month
const dueThisMonth = () => pickDay(0, 0, 15);
const dueFarFuture = () => pickDay(0, 37, 15); // ~37 months out: past expiration

describe('CriticalDateModal (entry validation)', () => {
  it('requires a due date', () => {
    const { form } = renderOpen();
    fireEvent.submit(form);
    expect(screen.getByRole('alert').textContent).toBe('Due date is required');
  });

  it('rejects past due dates for future obligations', () => {
    const { form } = renderOpen();
    duePast();
    fireEvent.submit(form);
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toContain(
      'Future obligations cannot carry a past due date',
    );
  });

  it('allows backdating when the entry is not a future obligation', () => {
    const { form, onClose } = renderOpen();
    duePast();
    fireEvent.click(screen.getByLabelText(/Future obligation/i));
    fireEvent.submit(form);
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects dates on or after lease expiration', () => {
    const { form } = renderOpen();
    dueFarFuture();
    fireEvent.submit(form);
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toContain('Date must fall before lease expiration');
  });

  it('shows the option-notice field for renewal options and rejects deadlines past expiration', () => {
    const { form, type } = renderOpen();
    fireEvent.change(type, { target: { value: 'Renewal Option' } });
    dueThisMonth();
    pickDay(1, 37, 15); // notice ~37 months out: past expiration
    fireEvent.submit(form);
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toContain('Option notice deadline must precede the expiration date');
  });

  it('accepts a valid future entry and closes', () => {
    const { onClose, form } = renderOpen();
    dueThisMonth();
    fireEvent.submit(form);
    expect(onClose).toHaveBeenCalled();
  });
});
