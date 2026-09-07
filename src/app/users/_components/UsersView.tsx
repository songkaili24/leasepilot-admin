'use client';

import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Badge, Button, DataTable, StatCard } from '@/components/ui';
import { InviteUserModal } from '@/components/users/InviteUserModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { platformUsers } from '@/lib/data';
import { formatDateTime, timeAgo } from '@/lib/dates';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import type { PlatformRole, PlatformUser } from '@/lib/types';

const ROLES: PlatformRole[] = ['Admin', 'Property Manager', 'Read-Only'];

const roleTone: Record<PlatformRole, 'teal' | 'navy' | 'slate'> = {
  Admin: 'teal',
  'Property Manager': 'navy',
  'Read-Only': 'slate',
};

const statusTone: Record<PlatformUser['status'], 'teal' | 'amber' | 'red'> = {
  Active: 'teal',
  Invited: 'amber',
  Suspended: 'red',
};

const inputClasses =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

export function UsersView() {
  const [users, setUsers] = useState<PlatformUser[]>(platformUsers);
  const [inviteOpen, setInviteOpen] = useState(false);

  const active = users.filter((u) => u.status === 'Active').length;
  const pending = users.filter((u) => u.status === 'Invited').length;
  const admins = users.filter((u) => u.role === 'Admin').length;

  function handleInvite(name: string, email: string, role: PlatformRole) {
    setUsers((prev) => [
      {
        id: `u-local-${Date.now()}`,
        name,
        email,
        role,
        lastActiveAt: null,
        status: 'Invited',
      },
      ...prev,
    ]);
    setInviteOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Seat management for the workspace. Every role change is captured in the audit log."
        actions={
          <Button size="md" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden className="h-4 w-4" />
            Invite user
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Seats"
          value={String(active)}
          subvalue={`${users.length} total accounts`}
          hint="Users with Active status and SSO access to the workspace."
        />
        <StatCard
          label="Pending Invitations"
          value={String(pending)}
          subvalue="Awaiting first sign-in"
          hint="Invited accounts expire after 14 days without activation."
        />
        <StatCard
          label="Admin Seats"
          value={String(admins)}
          subvalue="Full portfolio control"
          hint="Admins manage users, roles, retention, and portfolio configuration."
        />
      </div>

      <div className="mt-6">
        <DataTable
          ariaLabel="Platform users"
          entityLabel="users"
          rows={users}
          getRowId={(user) => user.id}
          searchPlaceholder="Search name or email…"
          initialPageSize={10}
          columns={[
            {
              key: 'name',
              header: 'User',
              accessor: (u) => `${u.name} ${u.email}`,
              sortable: true,
              render: (u) => (
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'Role',
              accessor: (u) => u.role,
              sortable: true,
              filterOptions: ROLES.map((role) => ({ label: role, value: role })),
              filterValue: (u) => u.role,
              render: (u) => <Badge tone={roleTone[u.role]}>{u.role}</Badge>,
            },
            {
              key: 'status',
              header: 'Status',
              accessor: (u) => u.status,
              sortable: true,
              filterOptions: (['Active', 'Invited', 'Suspended'] as const).map((status) => ({
                label: status,
                value: status,
              })),
              filterValue: (u) => u.status,
              render: (u) => (
                <Badge tone={statusTone[u.status]} dot>
                  {u.status}
                </Badge>
              ),
            },
            {
              key: 'lastActive',
              header: 'Last active',
              accessor: (u) => u.lastActiveAt ?? '',
              sortable: true,
              render: (u) => (
                <span className="text-xs text-slate-500">
                  {u.lastActiveAt ? (
                    <>
                      <time dateTime={u.lastActiveAt} title={formatDateTime(u.lastActiveAt)}>
                        {timeAgo(u.lastActiveAt)}
                      </time>
                    </>
                  ) : (
                    'Never signed in'
                  )}
                </span>
              ),
            },
          ]}
          mobileCard={(user) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-navy-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Badge tone={statusTone[user.status]} dot>
                  {user.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={roleTone[user.role]}>{user.role}</Badge>
                <span className="text-xs text-slate-400">
                  {user.lastActiveAt ? timeAgo(user.lastActiveAt) : 'Never signed in'}
                </span>
              </div>
            </div>
          )}
        />
      </div>

      <section className="mt-10" aria-labelledby="matrix-heading">
        <h2 id="matrix-heading" className="text-base font-semibold text-navy-900">
          Permission matrix
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Capabilities by role. Role changes and seat lifecycle events are recorded in the audit
          log.
        </p>
        <div className="mt-4">
          <PermissionMatrix />
        </div>
      </section>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </>
  );
}
