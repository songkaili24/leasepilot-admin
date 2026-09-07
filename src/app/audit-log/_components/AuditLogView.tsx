'use client';

import { useMemo, useState } from 'react';
import { DataTable, StatCard } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { auditEntries, platformUsers } from '@/lib/data';
import { auditActionTone, MUTATING_ACTIONS } from '@/lib/audit-format';
import { formatDateTime, timeAgo } from '@/lib/dates';
import { Badge } from '@/components/ui/Badge';
import type { AuditActionType } from '@/lib/types';

const ACTION_TYPES = Object.keys(auditActionTone) as AuditActionType[];

export function AuditLogView() {
  const [actorFilter, setActorFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [mutatingOnly, setMutatingOnly] = useState(false);

  const filtered = useMemo(
    () =>
      auditEntries.filter((entry) => {
        if (actorFilter !== 'all' && entry.actor !== actorFilter) return false;
        if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
        if (mutatingOnly && !MUTATING_ACTIONS.includes(entry.action)) return false;
        return true;
      }),
    [actorFilter, actionFilter, mutatingOnly],
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = auditEntries.filter((e) => e.at.startsWith(today)).length;
  const mutatingCount = auditEntries.filter((e) => MUTATING_ACTIONS.includes(e.action)).length;
  const activeUsers = platformUsers.filter((u) => u.status === 'Active').length;

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Immutable chronological record of every system action. Entries are append-only and retained seven years per policy."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Entries Today"
          value={String(todayCount)}
          subvalue={`${auditEntries.length} total on record`}
          hint="All sign-ins, record changes, and administrative actions captured since midnight."
        />
        <StatCard
          label="Record Changes"
          value={String(mutatingCount)}
          subvalue="Mutating actions (create, update, delete)"
          hint="State-changing operations — the set auditors sample during SOC 2 fieldwork."
        />
        <StatCard
          label="Active Users"
          value={String(activeUsers)}
          subvalue="SSO with MFA enforced"
          hint="Users with Active status. Every session is recorded with actor and timestamp."
        />
      </div>

      <div className="mt-6">
        <DataTable
          ariaLabel="Audit log entries"
          entityLabel="entries"
          rows={filtered}
          getRowId={(entry) => entry.id}
          searchable
          searchPlaceholder="Search actor, record, detail…"
          initialPageSize={15}
          toolbar={
            <>
              <select
                aria-label="Filter by user"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <option value="all">All users</option>
                {platformUsers.map((user) => (
                  <option key={user.id} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by action type"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <option value="all">All action types</option>
                {ACTION_TYPES.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-navy-900">
                <input
                  type="checkbox"
                  checked={mutatingOnly}
                  onChange={(e) => setMutatingOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                />
                Record changes only
              </label>
            </>
          }
          columns={[
            {
              key: 'at',
              header: 'Timestamp',
              accessor: (e) => e.at,
              sortable: true,
              className: 'whitespace-nowrap',
              render: (e) => (
                <div>
                  <time dateTime={e.at} className="font-mono text-xs tabular-nums text-navy-900">
                    {formatDateTime(e.at)}
                  </time>
                  <p className="text-[11px] text-slate-400">{timeAgo(e.at)}</p>
                </div>
              ),
            },
            {
              key: 'actor',
              header: 'User',
              accessor: (e) => e.actor,
              sortable: true,
              filterOptions: platformUsers.map((u) => ({ label: u.name, value: u.name })),
              filterValue: (e) => e.actor,
              render: (e) => <span className="font-medium">{e.actor}</span>,
            },
            {
              key: 'action',
              header: 'Action',
              accessor: (e) => e.action,
              sortable: true,
              filterOptions: ACTION_TYPES.map((action) => ({ label: action, value: action })),
              filterValue: (e) => e.action,
              render: (e) => <Badge tone={auditActionTone[e.action]}>{e.action}</Badge>,
            },
            {
              key: 'record',
              header: 'Affected record',
              accessor: (e) => e.record,
              sortable: true,
              render: (e) =>
                e.recordHref ? (
                  <a
                    href={e.recordHref}
                    className="font-mono text-xs font-medium tabular-nums text-teal-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    {e.record}
                  </a>
                ) : (
                  <span className="text-sm">{e.record}</span>
                ),
            },
            {
              key: 'detail',
              header: 'Detail',
              accessor: (e) => e.detail,
              render: (e) => (
                <span className="block max-w-md truncate text-xs text-slate-500" title={e.detail}>
                  {e.detail}
                </span>
              ),
            },
            {
              key: 'source',
              header: 'Source',
              accessor: (e) => e.source,
              sortable: true,
              render: (e) => (
                <span className="font-mono text-[11px] uppercase tracking-wide text-slate-400">
                  {e.source}
                </span>
              ),
            },
          ]}
          mobileCard={(entry) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={auditActionTone[entry.action]}>{entry.action}</Badge>
                <time
                  dateTime={entry.at}
                  className="font-mono text-[11px] tabular-nums text-slate-400"
                >
                  {timeAgo(entry.at)}
                </time>
              </div>
              <p className="mt-1.5 text-sm font-medium text-navy-900">{entry.record}</p>
              <p className="mt-0.5 text-xs text-slate-500">{entry.detail}</p>
              <p className="mt-1 text-xs text-slate-400">
                {entry.actor} · {formatDateTime(entry.at)}
              </p>
            </div>
          )}
        />
      </div>
    </>
  );
}
