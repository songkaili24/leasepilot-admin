import { LeaseStatusBadge } from '@/components/ui';
import { properties } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import { formatArea, formatCurrency } from '@/lib/format';
import type { Lease } from '@/lib/types';

const propertyById = new Map(properties.map((p) => [p.id, p]));

/** Card-based representation for narrow viewports (rendered by DataTable). */
export function LeaseCard({ lease }: { lease: Lease }) {
  const property = propertyById.get(lease.propertyId);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-navy-900">{lease.tenantName}</p>
        <LeaseStatusBadge status={lease.status} />
      </div>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500">
        {lease.leaseNumber} · Suite {lease.suite}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-slate-400">Property</dt>
          <dd className="mt-0.5 text-navy-900">
            {property?.name} · {property?.city}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Monthly rent</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatCurrency(lease.baseRentMonthly)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Term</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatDate(lease.commencementDate)} → {formatDate(lease.expirationDate)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Rentable</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-navy-900">
            {formatArea(lease.rentableSf)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
