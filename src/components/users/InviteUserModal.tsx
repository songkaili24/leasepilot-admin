'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { emailError, required } from '@/lib/validation';
import type { PlatformRole } from '@/lib/types';

const ROLES: PlatformRole[] = ['Admin', 'Property Manager', 'Read-Only'];

const inputClasses =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

/** Validated invitation modal: name required, business email format, role select. */
export function InviteUserModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (name: string, email: string, role: PlatformRole) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PlatformRole>('Property Manager');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function close() {
    onClose();
    setName('');
    setEmail('');
    setRole('Property Manager');
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    const nameError = required(name, 'Full name');
    const mailError = emailError(email);
    if (nameError) next.name = nameError;
    if (mailError) next.email = mailError;
    setErrors(next);
    if (!next.name && !next.email) {
      onInvite(name.trim(), email.trim(), role);
      close();
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite user"
      description="The invitee receives an activation link valid for 14 days."
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="invite-user-form">
            Send invitation
          </Button>
        </>
      }
    >
      <form id="invite-user-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="invite-name" className={labelClasses}>
            Full name
          </label>
          <input
            id="invite-name"
            className={`${inputClasses} ${errors.name ? 'border-red-400' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'invite-name-error' : undefined}
          />
          {errors.name ? (
            <p id="invite-name-error" className="mt-1 text-xs font-medium text-red-700">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="invite-email" className={labelClasses}>
            Business email
          </label>
          <input
            id="invite-email"
            type="email"
            className={`${inputClasses} ${errors.email ? 'border-red-400' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'invite-email-error' : undefined}
          />
          {errors.email ? (
            <p id="invite-email-error" className="mt-1 text-xs font-medium text-red-700">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="invite-role" className={labelClasses}>
            Role
          </label>
          <select
            id="invite-role"
            className={inputClasses}
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Property Managers edit abstracts and upload documents; Read-Only is view-only.
          </p>
        </div>
      </form>
    </Modal>
  );
}
