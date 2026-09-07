// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AbstractWizardButton } from '@/components/layout/AbstractWizardButton';

afterEach(cleanup);

function openWizard() {
  fireEvent.click(screen.getByRole('button', { name: /New Lease Abstract/i }));
}

function fillStep0() {
  fireEvent.change(screen.getByLabelText(/Tenant legal name/i), {
    target: { value: 'Halloran & Mercer LLP' },
  });
  fireEvent.change(screen.getByLabelText(/SSM \/ company registration/i), {
    target: { value: '201901000001' },
  });
}

function pickFirstDate(index: number) {
  const triggers = screen
    .getAllByRole('button')
    .filter((b) => b.getAttribute('aria-haspopup') === 'dialog');
  fireEvent.click(triggers[index]);
  fireEvent.click(screen.getAllByRole('button', { name: '15' })[0]);
}

describe('AbstractWizardButton (multi-step intake)', () => {
  it('opens on step 1 with the step indicator', () => {
    render(<AbstractWizardButton />);
    openWizard();
    expect(screen.getByText(/Step 1 of 4 — Parties/)).toBeTruthy();
    expect(screen.getAllByText('Parties').length).toBeGreaterThan(0);
  });

  it('gates step 1 on tenant name and SSM format', () => {
    render(<AbstractWizardButton />);
    openWizard();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
    expect(alerts).toContain('Tenant legal name is required');
    expect(alerts).toContain('SSM / company registration number is required');
    // Still on step 1.
    expect(screen.getByText(/Step 1 of 4/)).toBeTruthy();
  });

  it('walks parties → term → dates → review and creates the abstract', () => {
    render(<AbstractWizardButton />);
    openWizard();

    fillStep0();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/Step 2 of 4 — Term & rent/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Annual base rent/i), {
      target: { value: '420000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/Step 3 of 4 — Dates & options/)).toBeTruthy();

    pickFirstDate(0); // commencement
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText(/Step 4 of 4 — Review/)).toBeTruthy();
    expect(screen.getByText('Halloran & Mercer LLP')).toBeTruthy();
    expect(screen.getByText('201901000001')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Create abstract/i }));
    expect(screen.getByText(/Abstract intake created for Halloran & Mercer LLP/)).toBeTruthy();
  });

  it('goes back without losing entered values', () => {
    render(<AbstractWizardButton />);
    openWizard();
    fillStep0();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    const tenant = screen.getByLabelText(/Tenant legal name/i) as HTMLInputElement;
    expect(tenant.value).toBe('Halloran & Mercer LLP');
    expect(screen.getByText(/Step 1 of 4/)).toBeTruthy();
  });

  it('resets state after closing a submitted wizard', async () => {
    render(<AbstractWizardButton />);
    openWizard();
    fillStep0();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.change(screen.getByLabelText(/Annual base rent/i), { target: { value: '420000' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    pickFirstDate(0); // commencement required to clear the dates step
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /Create abstract/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    // The wizard resets on a short timer after close; wait it out, then reopen.
    await new Promise((r) => setTimeout(r, 200));
    openWizard();
    expect(screen.getByText(/Step 1 of 4/)).toBeTruthy();
    expect((screen.getByLabelText(/Tenant legal name/i) as HTMLInputElement).value).toBe('');
  });

  it('cancels from step 1 via the Cancel button', () => {
    render(<AbstractWizardButton />);
    openWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText(/Step 1 of 4/)).toBeNull();
  });
});
