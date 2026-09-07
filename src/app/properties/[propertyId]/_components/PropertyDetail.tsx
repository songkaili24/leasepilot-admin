import Link from 'next/link';
import { Building2, MapPin } from 'lucide-react';
import { Badge, LeaseStatusBadge, StatCard } from '@/components/ui';
import { leasesByProperty, portfolioName } from '@/lib/data';
import { formatDate, toISODate } from '@/lib/dates';
import { formatArea, formatCurrency, formatPct } from '@/lib/format';
import type { Property } from '@/lib/types';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';

interface PropertyDetailProps {
  property: Property;
  occupancy: number;
}

export function PropertyDetail({ property, occupancy }: PropertyDetailProps) {
  const propertyLeases = leasesByProperty(property.id);
  const today = toISODate(new Date());

  const currentLeases = propertyLeases.filter((l) => l.status !== 'Terminated');
  const leasedSf = currentLeases.reduce((sum, l) => sum + l.rentableSf, 0);
  const annualBaseRent = currentLeases.reduce((sum, l) => sum + l.baseRentMonthly * 12, 0);
  const weightedTerm =
    leasedSf > 0
      ? currentLeases.reduce(
          (sum, l) =>
            sum + l.rentableSf * (Number(l.expirationDate.slice(0, 4)) - Number(today.slice(0, 4))),
          0,
        ) / leasedSf
      : 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Building2 aria-hidden className="h-5 w-5 text-slate-400" />
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">{property.name}</h1>
            <Badge tone="slate">{property.type}</Badge>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-slate-400" />
            {property.address}, {property.city}, {property.state} {property.postalCode}
          </p>
        </div>
        <p className="text-xs text-slate-500">Portfolio: {portfolioName(property.portfolioId)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Occupancy"
          value={formatPct(occupancy)}
          subvalue={`${formatArea(leasedSf)} leased of ${formatArea(property.grossFloorAreaSf)}`}
        />
        <StatCard
          label="Annualized Base Rent"
          value={formatCurrency(annualBaseRent)}
          subvalue={`${currentLeases.length} rent-paying abstracts`}
        />
        <StatCard
          label="Weighted Avg Term"
          value={`${Math.max(0, weightedTerm).toFixed(1)} yrs`}
          subvalue="By leased area"
          hint="Remaining years to expiration, weighted by rentable square feet."
        />
      </div>

      <div className={cardClasses + ' mt-6 overflow-hidden'}>
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-navy-900">Leases at this property</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-sm">
            <caption className="sr-only">Lease abstracts at {property.name}</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-2">
                  Lease #
                </th>
                <th scope="col" className="px-4 py-2">
                  Tenant
                </th>
                <th scope="col" className="px-4 py-2">
                  Suite
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Rentable SF
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  Base Rent / yr
                </th>
                <th scope="col" className="px-4 py-2">
                  Expires
                </th>
                <th scope="col" className="px-4 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyLeases.map((lease) => (
                <tr key={lease.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/leases/${lease.id}`}
                      className="font-mono text-xs font-medium tabular-nums text-teal-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      {lease.leaseNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{lease.tenantName}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{lease.suite}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {formatArea(lease.rentableSf)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(lease.baseRentMonthly * 12)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">
                    {formatDate(lease.expirationDate)}
                  </td>
                  <td className="px-4 py-2.5">
                    <LeaseStatusBadge status={lease.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
