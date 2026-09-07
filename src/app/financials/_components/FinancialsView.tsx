'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable, StatCard } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { allObligations } from '@/lib/search';
import { formatDate, toISODate } from '@/lib/dates';
import { formatCurrency, formatPct } from '@/lib/format';
import type { ObligationRow } from '@/lib/search';

export function FinancialsView() {
  const rows = useMemo(() => allObligations(), []);
  const today = toISODate(new Date());

  const totalAnnual = rows.reduce((sum, r) => sum + r.annualAmount, 0);
  const overdue = rows.filter((r) => r.nextDueDate < today);
  const overdueTotal = overdue.reduce((sum, r) => sum + Math.round(r.annualAmount / 12), 0);

  const byCategory = new Map<string, number>();
  for (const row of rows) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.annualAmount);
  }
  const topCategories = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title="Financial Obligations"
        description="Recurring financial commitments per lease, with the next payment event for each category."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Annual Obligations"
          value={formatCurrency(totalAnnual)}
          subvalue={`${rows.length} tracked line items`}
          hint="Sum of annualized amounts across all obligation categories and leases."
        />
        <StatCard
          label="Overdue Payments"
          value={String(overdue.length)}
          subvalue={`${formatCurrency(overdueTotal)} past due this cycle`}
          hint="Line items whose next due date has passed. Reconcile before period close."
        />
        <StatCard
          label="Top Cost Categories"
          value={topCategories[0] ? topCategories[0][0] : '—'}
          subvalue={
            topCategories.length
              ? topCategories.map(([cat, amt]) => `${cat} ${formatCurrency(amt)}`).join(' · ')
              : undefined
          }
          hint="The three largest obligation categories by annualized amount."
        />
      </div>

      <div className="mt-6">
        <DataTable
          ariaLabel="Financial obligations"
          entityLabel="obligations"
          rows={rows}
          getRowId={(row) => row.id}
          getRowHref={(row) => `/leases/${row.leaseId}`}
          searchPlaceholder="Search tenant, lease number, category…"
          initialPageSize={25}
          columns={[
            {
              key: 'leaseNumber',
              header: 'Lease #',
              accessor: (r) => r.leaseNumber,
              sortable: true,
              render: (r) => (
                <Link
                  href={`/leases/${r.leaseId}`}
                  className="font-mono text-xs font-medium tabular-nums text-teal-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {r.leaseNumber}
                </Link>
              ),
            },
            {
              key: 'tenant',
              header: 'Tenant',
              accessor: (r) => r.tenantName,
              sortable: true,
              render: (r) => <span className="font-medium">{r.tenantName}</span>,
            },
            {
              key: 'category',
              header: 'Category',
              accessor: (r) => r.category,
              sortable: true,
              filterOptions: Array.from(new Set(rows.map((r) => r.category)))
                .sort()
                .map((c) => ({ label: c, value: c })),
              filterValue: (r) => r.category,
              render: (r) => <span className="font-medium">{r.category}</span>,
            },
            {
              key: 'description',
              header: 'Terms',
              accessor: (r) => r.description,
              render: (r) => (
                <span
                  className="block max-w-md truncate text-xs text-slate-500"
                  title={r.description}
                >
                  {r.description}
                </span>
              ),
            },
            {
              key: 'annualAmount',
              header: 'Annual',
              align: 'right',
              headerTooltip:
                'Annualized amount for this obligation line, as abstracted from the lease.',
              accessor: (r) => r.annualAmount,
              sortable: true,
              render: (r) => (
                <span className="font-mono text-xs font-medium tabular-nums">
                  {formatCurrency(r.annualAmount)}
                </span>
              ),
            },
            {
              key: 'frequency',
              header: 'Frequency',
              accessor: (r) => r.frequency,
              sortable: true,
              filterOptions: [
                { label: 'Monthly', value: 'Monthly' },
                { label: 'Quarterly', value: 'Quarterly' },
                { label: 'Annual', value: 'Annual' },
              ],
              filterValue: (r) => r.frequency,
            },
            {
              key: 'escalationPct',
              header: 'Escalation',
              align: 'right',
              accessor: (r) => r.escalationPct,
              sortable: true,
              render: (r) => (
                <span className="font-mono text-xs tabular-nums text-slate-600">
                  {r.escalationPct > 0 ? formatPct(r.escalationPct) : '—'}
                </span>
              ),
            },
            {
              key: 'nextDueDate',
              header: 'Next due',
              accessor: (r) => r.nextDueDate,
              sortable: true,
              render: (r) => {
                const isOverdue = r.nextDueDate < today;
                return (
                  <time
                    dateTime={r.nextDueDate}
                    className={`font-mono text-xs tabular-nums ${isOverdue ? 'font-semibold text-red-700' : 'text-slate-600'}`}
                  >
                    {formatDate(r.nextDueDate)}
                  </time>
                );
              },
            },
          ]}
          mobileCard={(row: ObligationRow) => (
            <Link
              href={`/leases/${row.leaseId}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-navy-900">{row.tenantName}</p>
                <span className="font-mono text-xs font-medium tabular-nums text-navy-900">
                  {formatCurrency(row.annualAmount)}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500">
                {row.leaseNumber} · {row.category}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {row.frequency} · next due{' '}
                <span
                  className={
                    row.nextDueDate < today ? 'font-semibold text-red-700' : 'text-navy-900'
                  }
                >
                  {formatDate(row.nextDueDate)}
                </span>
              </p>
            </Link>
          )}
        />
      </div>
    </>
  );
}
