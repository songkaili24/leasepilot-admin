'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DataTable, StatCard } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { allObligations } from '@/lib/search';
import { formatDate, toISODate } from '@/lib/dates';
import { formatCurrency } from '@/lib/format';
import type { ObligationRow } from '@/lib/search';
import type { ObligationCategory, Property } from '@/lib/types';
import { properties } from '@/lib/data';

const OBLIGATION_TYPES: ObligationCategory[] = [
  'Base Rent',
  'CAM',
  'Insurance',
  'Tax Escrow',
  'Real Estate Taxes',
];

const propertyById = new Map(properties.map((p) => [p.id, p]));

export function FinancialsView() {
  const rows = useMemo(() => allObligations(), []);
  const today = toISODate(new Date());

  const overdue = rows.filter((r) => r.nextDueDate < today);
  const next30 = rows.filter((r) => {
    const days = (Date.parse(r.nextDueDate) - Date.parse(today)) / 86_400_000;
    return days >= 0 && days <= 30;
  });
  const monthlyTotal = rows
    .filter((r) => r.frequency === 'Monthly')
    .reduce((sum, r) => sum + Math.round(r.annualAmount / 12), 0);
  const upcoming30Total = next30.reduce(
    (sum, r) =>
      sum +
      Math.round(
        r.annualAmount / (r.frequency === 'Monthly' ? 12 : r.frequency === 'Quarterly' ? 4 : 1),
      ),
    0,
  );

  return (
    <>
      <PageHeader
        title="Financial Obligations"
        description="Every recurring financial commitment across the portfolio. Overdue items are highlighted in red."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Monthly Obligations"
          value={formatCurrency(monthlyTotal)}
          subvalue={`${rows.length} tracked line items`}
          hint="Sum of monthly-frequency commitments (Base Rent, CAM, tax escrow) across all leases."
        />
        <StatCard
          label="Upcoming (30 Days)"
          value={formatCurrency(upcoming30Total)}
          subvalue={`${next30.length} payments due`}
          hint="Payments falling due within the next 30 days across all frequencies."
        />
        <StatCard
          label="Overdue"
          value={String(overdue.length)}
          subvalue={
            overdue.length > 0
              ? `${formatCurrency(Math.round(overdue.reduce((s, r) => s + r.annualAmount / 12, 0)))} past due`
              : 'Nothing past due'
          }
          hint="Line items whose next due date has passed. Reconcile before period close."
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
          initialPageSize={15}
          columns={[
            {
              key: 'tenant',
              header: 'Tenant',
              accessor: (r) => r.tenantName,
              sortable: true,
              render: (r) => (
                <Link
                  href={`/leases/${r.leaseId}`}
                  className="font-medium text-navy-900 hover:text-teal-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {r.tenantName}
                  <span className="block font-mono text-[11px] font-normal tabular-nums text-slate-500">
                    {r.leaseNumber}
                  </span>
                </Link>
              ),
            },
            {
              key: 'property',
              header: 'Property',
              accessor: (r) => propertyById.get(r.propertyId)?.name ?? '',
              sortable: true,
              filterOptions: properties.map((p: Property) => ({ label: p.name, value: p.id })),
              filterValue: (r) => r.propertyId,
              render: (r) => {
                const property = propertyById.get(r.propertyId);
                return (
                  <span className="text-sm">
                    {property?.name}
                    <span className="block text-xs text-slate-500">
                      {property?.city}, {property?.state}
                    </span>
                  </span>
                );
              },
            },
            {
              key: 'category',
              header: 'Obligation Type',
              accessor: (r) => r.category,
              sortable: true,
              filterOptions: OBLIGATION_TYPES.map((category) => ({
                label: category,
                value: category,
              })),
              filterValue: (r) => r.category,
              render: (r) => <span className="font-medium">{r.category}</span>,
            },
            {
              key: 'annualAmount',
              header: 'Amount (Annual)',
              align: 'right',
              headerTooltip:
                'Annualized amount for this obligation line, as abstracted from the lease.',
              accessor: (r) => r.annualAmount,
              sortable: true,
              render: (r) => (
                <span className="font-mono text-xs font-medium tabular-nums">
                  {formatCurrency(r.annualAmount)}
                  <span className="block text-[10px] font-normal text-slate-400">
                    {r.frequency}
                  </span>
                </span>
              ),
            },
            {
              key: 'nextDueDate',
              header: 'Due Date',
              accessor: (r) => r.nextDueDate,
              sortable: true,
              render: (r) => {
                const isOverdue = r.nextDueDate < today;
                return (
                  <time
                    dateTime={r.nextDueDate}
                    className={
                      isOverdue
                        ? 'font-mono text-xs font-semibold tabular-nums text-red-700'
                        : 'font-mono text-xs tabular-nums text-slate-600'
                    }
                  >
                    {formatDate(r.nextDueDate)}
                    {isOverdue ? (
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-red-700">
                        Overdue
                      </span>
                    ) : null}
                  </time>
                );
              },
            },
            {
              key: 'status',
              header: 'Status',
              accessor: (r) => (r.nextDueDate < today ? 'Overdue' : 'Scheduled'),
              sortable: true,
              filterOptions: [
                { label: 'Overdue', value: 'Overdue' },
                { label: 'Scheduled', value: 'Scheduled' },
              ],
              filterValue: (r) => (r.nextDueDate < today ? 'Overdue' : 'Scheduled'),
              render: (r) =>
                r.nextDueDate < today ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-200">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-200">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    Scheduled
                  </span>
                ),
            },
          ]}
          mobileCard={(row: ObligationRow) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                {row.frequency} · due{' '}
                <span
                  className={
                    row.nextDueDate < today ? 'font-semibold text-red-700' : 'text-navy-900'
                  }
                >
                  {formatDate(row.nextDueDate)}
                </span>
              </p>
            </div>
          )}
        />
      </div>
    </>
  );
}
