// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { InviteUserModal } from '@/components/users/InviteUserModal';

afterEach(cleanup);

function renderOpen(onInvite = vi.fn()) {
  const onClose = vi.fn();
  render(<InviteUserModal open onClose={onClose} onInvite={onInvite} />);
  const form = document.querySelector('#invite-user-form') as HTMLFormElement;
  const name = document.querySelector('#invite-name') as HTMLInputElement;
  const email = document.querySelector('#invite-email') as HTMLInputElement;
  const role = document.querySelector('#invite-role') as HTMLSelectElement;
  return { onClose, onInvite, form, name, email, role };
}

describe('InviteUserModal', () => {
  it('blocks submission when name and email are missing, with per-field errors', () => {
    const { onInvite, form } = renderOpen();
    fireEvent.submit(form);
    expect(screen.getByText('Full name is required')).toBeTruthy();
    expect(screen.getByText('Email is required')).toBeTruthy();
    expect(onInvite).not.toHaveBeenCalled();
  });

  it('rejects malformed emails with an inline error', () => {
    const { onInvite, form, name, email } = renderOpen();
    fireEvent.change(name, { target: { value: 'Dana Okafor' } });
    fireEvent.change(email, { target: { value: 'dana@leasevault' } });
    fireEvent.submit(form);
    expect(screen.getByText('Enter a valid business email')).toBeTruthy();
    expect(onInvite).not.toHaveBeenCalled();
  });

  it('invites with trimmed values and closes on success', () => {
    const { onInvite, onClose, form, name, email } = renderOpen();
    fireEvent.change(name, { target: { value: '  Dana Okafor  ' } });
    fireEvent.change(email, { target: { value: '  d.okafor@leasevault.com  ' } });
    fireEvent.submit(form);
    expect(onInvite).toHaveBeenCalledWith(
      'Dana Okafor',
      'd.okafor@leasevault.com',
      'Property Manager',
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('passes the selected role through', () => {
    const { onInvite, form, name, email, role } = renderOpen();
    fireEvent.change(name, { target: { value: 'Priya Raghavan' } });
    fireEvent.change(email, { target: { value: 'p.raghavan@leasevault.com' } });
    fireEvent.change(role, { target: { value: 'Read-Only' } });
    fireEvent.submit(form);
    expect(onInvite).toHaveBeenCalledWith(
      'Priya Raghavan',
      'p.raghavan@leasevault.com',
      'Read-Only',
    );
  });

  it('defaults the role to Property Manager', () => {
    const { role } = renderOpen();
    expect((role as unknown as HTMLSelectElement).value).toBe('Property Manager');
  });

  it('resets and closes via cancel', () => {
    const { onClose, form, name } = renderOpen();
    fireEvent.change(name, { target: { value: 'Someone' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
    fireEvent.submit(form);
    expect(screen.getByText('Full name is required')).toBeTruthy(); // state cleared
  });
});
