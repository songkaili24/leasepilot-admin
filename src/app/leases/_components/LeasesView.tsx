'use client';

import Link from 'next/link';
import { DataTable, LeaseStatusBadge } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { leases, portfolioName, properties } from '@/lib/data';
import { diffInDays, formatDate, toISODate } from '@/lib/dates';
import { formatArea, formatCurrency } from '@/lib/format';
import type { Lease, LeaseStatus } from '@/lib/types';

const propertyById = new Map(properties.map((p) => [p.id, p]));

const STATUS_OPTIONS = (['Active', 'Expiring', 'Renewed', 'Terminated'] as LeaseStatus[]).map(
  (status) => ({ label: status, value: status }),
);

const PORTFOLIO_OPTIONS = Array.from(new Set(leases.map((l) => l.portfolioId))).map((pid) => ({
  label: portfolioName(pid),
  value: pid,
}));

export function LeasesView() {
  const today = toISODate(new Date());

  return (
    <>
      <PageHeader
        title="All Leases"
        description="Every lease abstract in the working portfolio. Select a row to open the full abstract."
      />

      {/* Desktop / tablet: full data table */}
      <DataTable
        ariaLabel="Lease abstracts"
        entityLabel="leases"
        rows={leases}
        getRowId={(lease) => lease.id}
        getRowHref={(lease) => `/leases/${lease.id}`}
        searchPlaceholder="Search tenant, lease number, property…"
        initialPageSize={25}
        pageSizeOptions={[10, 25, 50]}
        columns={[
          {
            key: 'leaseNumber',
            header: 'Lease #',
            accessor: (l) => l.leaseNumber,
            sortable: true,
            render: (l) => (
              <Link
                href={`/leases/${l.id}`}
                className="font-mono text-xs font-medium tabular-nums text-teal-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {l.leaseNumber}
              </Link>
            ),
          },
          {
            key: 'tenant',
            header: 'Tenant',
            accessor: (l) => l.tenantName,
            sortable: true,
            render: (l) => (
              <div>
                <p className="font-medium">{l.tenantName}</p>
                <p className="text-xs text-slate-500">
                  Suite {l.suite} · {propertyById.get(l.propertyId)?.name}
                </p>
              </div>
            ),
          },
          {
            key: 'portfolio',
            header: 'Portfolio',
            accessor: (l) => portfolioName(l.portfolioId),
            sortable: true,
            filterOptions: PORTFOLIO_OPTIONS,
            filterValue: (l) => l.portfolioId,
          },
          {
            key: 'rentableSf',
            header: 'Rentable SF',
            align: 'right',
            accessor: (l) => l.rentableSf,
            sortable: true,
            render: (l) => (
              <span className="font-mono text-xs tabular-nums">{formatArea(l.rentableSf)}</span>
            ),
          },
          {
            key: 'baseRent',
            header: 'Base Rent / yr',
            align: 'right',
            headerTooltip:
              'Current monthly Base Rent annualized. Excludes CAM, taxes, and pass-throughs.',
            accessor: (l) => l.baseRentMonthly * 12,
            sortable: true,
            render: (l) => (
              <span className="font-mono text-xs tabular-nums">
                {formatCurrency(l.baseRentMonthly * 12)}
              </span>
            ),
          },
          {
            key: 'commencement',
            header: 'Commenced',
            accessor: (l) => l.commencementDate,
            sortable: true,
            render: (l) => (
              <time
                dateTime={l.commencementDate}
                className="font-mono text-xs tabular-nums text-slate-600"
              >
                {formatDate(l.commencementDate)}
              </time>
            ),
          },
          {
            key: 'expiration',
            header: 'Expires',
            accessor: (l) => l.expirationDate,
            sortable: true,
            render: (l) => {
              const days = diffInDays(today, l.expirationDate);
              const urgent = l.status === 'Active' && days <= 90;
              return (
                <div>
                  <time
                    dateTime={l.expirationDate}
                    className="font-mono text-xs tabular-nums text-slate-600"
                  >
                    {formatDate(l.expirationDate)}
                  </time>
                  {urgent ? (
                    <p className="text-[11px] font-medium text-amber-600">
                      {days <= 30 ? `${days} days` : `${days} days`} remaining
                    </p>
                  ) : null}
                </div>
              );
            },
          },
          {
            key: 'status',
            header: 'Status',
            accessor: (l) => l.status,
            sortable: true,
            filterOptions: STATUS_OPTIONS,
            filterValue: (l) => l.status,
            render: (l) => <LeaseStatusBadge status={l.status} />,
          },
        ]}
        mobileCard={(lease: Lease) => <LeaseCard lease={lease} />}
      />
    </>
  );
}

/** Card-based representation for narrow viewports (rendered by DataTable). */
function LeaseCard({ lease }: { lease: Lease }) {
  const property = propertyById.get(lease.propertyId);
  return (
    <Link
      href={`/leases/${lease.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-navy-900">{lease.tenantName}</p>
        <LeaseStatusBadge status={lease.status} />
      </div>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500">{lease.leaseNumber}</p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-slate-400">Property</dt>
          <dd className="mt-0.5 text-navy-900">
            {property?.name} · Suite {lease.suite}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Base Rent / yr</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatCurrency(lease.baseRentMonthly * 12)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Expires</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatDate(lease.expirationDate)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Rentable</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatArea(lease.rentableSf)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
