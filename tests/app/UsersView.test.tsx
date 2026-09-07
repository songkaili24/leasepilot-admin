// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { UsersView } from '@/app/users/_components/UsersView';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(cleanup);

function openInvite() {
  fireEvent.click(screen.getByRole('button', { name: /Invite user/i }));
  const form = document.querySelector('#invite-user-form') as HTMLFormElement;
  const name = document.querySelector('#invite-name') as HTMLInputElement;
  const email = document.querySelector('#invite-email') as HTMLInputElement;
  const role = document.querySelector('#invite-role') as HTMLSelectElement;
  return { form, name, email, role };
}

function seatRows(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Platform users' });
  return within(table).getAllByRole('row').slice(1); // drop header row
}

describe('UsersView', () => {
  it('renders stat cards and the seeded seat table', () => {
    render(<UsersView />);
    expect(screen.getByText('Active Seats')).toBeTruthy();
    expect(screen.getByText('Pending Invitations')).toBeTruthy();
    expect(screen.getByText('Admin Seats')).toBeTruthy();
    // Names render twice (desktop table + mobile card list); scope to the table.
    const table = screen.getByRole('table', { name: 'Platform users' });
    expect(within(table).getByText('Kelly Warren')).toBeTruthy();
    expect(within(table).getByText('External Auditor (KPMG)')).toBeTruthy();
  });

  it('badges roles and statuses', () => {
    render(<UsersView />);
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Property Manager').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invited').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Suspended').length).toBeGreaterThan(0);
  });

  it('blocks empty invitation submissions with inline errors', async () => {
    render(<UsersView />);
    const { form } = openInvite();
    fireEvent.submit(form);
    expect(await screen.findByText('Full name is required')).toBeTruthy();
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('adds an invited seat through the modal and surfaces it in the table', async () => {
    render(<UsersView />);
    const { form, name, email } = openInvite();
    fireEvent.change(name, { target: { value: 'New Property Manager' } });
    fireEvent.change(email, { target: { value: 'new.pm@leasevault.com' } });
    fireEvent.submit(form);

    await waitFor(() => {
      const table = screen.getByRole('table', { name: 'Platform users' });
      expect(within(table).getByText('New Property Manager')).toBeTruthy();
    });
    const table = screen.getByRole('table', { name: 'Platform users' });
    const row = within(table).getByText('new.pm@leasevault.com').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row!).getByText('Invited')).toBeTruthy();
    expect(within(row!).getByText('Property Manager')).toBeTruthy();
  });

  it('counts the new invitation in the pending stat card', async () => {
    render(<UsersView />);
    const pendingLabel = screen.getByText('Pending Invitations');
    const pendingCard = pendingLabel.closest('div')!.parentElement as HTMLElement;
    expect(pendingCard.textContent).toContain('1');
    const { form, name, email } = openInvite();
    fireEvent.change(name, { target: { value: 'Second Invite' } });
    fireEvent.change(email, { target: { value: 'second@leasevault.com' } });
    fireEvent.submit(form);
    await waitFor(() => {
      expect(pendingCard.textContent).toContain('2');
    });
  });

  it('shows never-signed-in for invited seats', async () => {
    render(<UsersView />);
    expect(screen.getAllByText('Never signed in').length).toBeGreaterThan(0);
  });

  it('renders the full permission matrix below the seat table', () => {
    render(<UsersView />);
    expect(screen.getByText('Permission matrix')).toBeTruthy();
    expect(screen.getByText('Manage users & roles')).toBeTruthy();
    expect(screen.getByText('Configure portfolio & retention')).toBeTruthy();
    const matrix = screen.getByText('Manage users & roles').closest('table') as HTMLTableElement;
    const adminColumnHeader = within(matrix).getByText('Admin');
    expect(adminColumnHeader).toBeTruthy();
  });

  it('keeps invited users awaiting first sign-in after reopening the modal', async () => {
    render(<UsersView />);
    const { form, name, email } = openInvite();
    fireEvent.change(name, { target: { value: 'Reopen Check' } });
    fireEvent.change(email, { target: { value: 'reopen@leasevault.com' } });
    fireEvent.submit(form);
    await waitFor(() => {
      const table = screen.getByRole('table', { name: 'Platform users' });
      expect(within(table).getByText('Reopen Check')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Invite user/i }));
    expect((document.querySelector('#invite-name') as HTMLInputElement).value).toBe('');
  });

  it('filters by role through the role column filter', () => {
    render(<UsersView />);
    fireEvent.change(screen.getByLabelText('Filter by Role'), {
      target: { value: 'Read-Only' },
    });
    const rows = seatRows();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(within(row).queryByText('Property Manager')).toBeNull();
    }
  });
});
