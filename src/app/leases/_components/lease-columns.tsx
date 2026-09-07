'use client';

import { LeaseStatusBadge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui/DataTable';
import { properties } from '@/lib/data';
import { diffInDays, formatDate } from '@/lib/dates';
import { formatArea, formatCurrency } from '@/lib/format';
import type { Lease, LeaseStatus } from '@/lib/types';

const propertyById = new Map(properties.map((p) => [p.id, p]));

export const ALL_STATUSES: LeaseStatus[] = ['Active', 'Expiring', 'Renewed', 'Terminated'];

/** Column set for the all-leases table: ID, tenant, property, dates, rent, status. */
export function buildLeaseColumns(
  today: string,
  propertyOptions: Array<{ id: string; label: string }>,
): Array<DataTableColumn<Lease>> {
  return [
    {
      key: 'leaseNumber',
      header: 'Lease ID',
      accessor: (l) => l.leaseNumber,
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-medium tabular-nums text-teal-800">
          {l.leaseNumber}
        </span>
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
            Suite {l.suite} · {formatArea(l.rentableSf)}
          </p>
        </div>
      ),
    },
    {
      key: 'property',
      header: 'Property',
      accessor: (l) => propertyById.get(l.propertyId)?.name ?? '',
      sortable: true,
      filterOptions: propertyOptions.map((p) => ({ label: p.label, value: p.id })),
      filterValue: (l) => l.propertyId,
      render: (l) => {
        const property = propertyById.get(l.propertyId);
        return (
          <div>
            <p>{property?.name}</p>
            <p className="text-xs text-slate-500">
              {property?.city}, {property?.state}
            </p>
          </div>
        );
      },
    },
    {
      key: 'commencement',
      header: 'Start Date',
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
      header: 'Expiry Date',
      accessor: (l) => l.expirationDate,
      sortable: true,
      render: (l) => {
        const days = diffInDays(today, l.expirationDate);
        const urgent = (l.status === 'Active' || l.status === 'Expiring') && days <= 90;
        return (
          <div>
            <time
              dateTime={l.expirationDate}
              className="font-mono text-xs tabular-nums text-slate-600"
            >
              {formatDate(l.expirationDate)}
            </time>
            {urgent && days >= 0 ? (
              <p
                className={
                  days <= 30
                    ? 'text-[11px] font-medium text-red-700'
                    : 'text-[11px] font-medium text-amber-600'
                }
              >
                {days} days remaining
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'baseRent',
      header: 'Monthly Rent',
      align: 'right',
      headerTooltip: 'Current monthly Base Rent. Excludes CAM, tax escrow, and pass-throughs.',
      accessor: (l) => l.baseRentMonthly,
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-medium tabular-nums">
          {formatCurrency(l.baseRentMonthly)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (l) => l.status,
      sortable: true,
      filterOptions: ALL_STATUSES.map((status) => ({ label: status, value: status })),
      filterValue: (l) => l.status,
      render: (l) => <LeaseStatusBadge status={l.status} />,
    },
  ];
}
