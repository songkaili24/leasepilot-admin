import { LeaseStatusBadge, Tooltip } from '@/components/ui';
import { Info } from 'lucide-react';
import { portfolioName } from '@/lib/data';
import { formatDate, formatDateLong } from '@/lib/dates';
import { formatArea, formatCurrency, formatPct, formatRate } from '@/lib/format';
import type { Lease, Property } from '@/lib/types';

const definitionClasses = 'text-xs font-medium text-slate-500';
const valueClasses = 'mt-0.5 text-sm font-medium text-navy-900';
const monoValueClasses = 'mt-0.5 font-mono text-sm font-medium tabular-nums text-navy-900';

function Definition({
  label,
  hint,
  mono = false,
  children,
}: {
  label: string;
  hint?: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className={definitionClasses}>
        {label}
        {hint ? (
          <Tooltip content={hint} className="ml-1 align-text-bottom">
            <span tabIndex={-1} aria-label={`About ${label}`}>
              <Info aria-hidden className="h-3.5 w-3.5 text-slate-400" />
            </span>
          </Tooltip>
        ) : null}
      </dt>
      <dd className={mono ? monoValueClasses : valueClasses}>{children}</dd>
    </div>
  );
}

/** The "Abstract" tab: headline facts and economics for a single lease. */
export function LeaseFactsGrid({ lease, property }: { lease: Lease; property?: Property }) {
  const remainingDays = Math.ceil(
    (Date.parse(lease.expirationDate) - Date.parse(formatDateLongToday())) / 86_400_000,
  );

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
      <Definition label="Lease number" mono>
        {lease.leaseNumber}
      </Definition>
      <Definition label="Status">
        <LeaseStatusBadge status={lease.status} />
      </Definition>
      <Definition label="Portfolio">{portfolioName(lease.portfolioId)}</Definition>
      <Definition label="Property">
        {property ? `${property.name} — Suite ${lease.suite}` : lease.propertyId}
      </Definition>
      <Definition
        label="Rentable area"
        hint="Rentable square feet per the BOMA standard measurement defined in the lease exhibit."
        mono
      >
        {formatArea(lease.rentableSf)}
      </Definition>
      <Definition label="Base rent (monthly)" mono>
        {formatCurrency(lease.baseRentMonthly)}
      </Definition>
      <Definition label="Base rent (annual)" mono>
        {formatCurrency(lease.baseRentMonthly * 12)}
      </Definition>
      <Definition
        label="Effective rate"
        hint="Annual Base Rent divided by rentable square feet."
        mono
      >
        {formatRate((lease.baseRentMonthly * 12) / lease.rentableSf)} / SF
      </Definition>
      <Definition label="Annual escalation" mono>
        {formatPct(lease.annualEscalationPct)}
      </Definition>
      <Definition label="Security deposit" mono>
        {formatCurrency(lease.securityDeposit)}
      </Definition>
      <Definition
        label="CAM recovery (annual)"
        hint="Tenant's estimated annual share of common area maintenance, reconciled annually."
        mono
      >
        {formatCurrency(lease.camRecoveryAnnual)}
      </Definition>
      <Definition label="Commencement">
        <time dateTime={lease.commencementDate}>{formatDateLong(lease.commencementDate)}</time>
      </Definition>
      <Definition label="Expiration">
        <time dateTime={lease.expirationDate}>{formatDateLong(lease.expirationDate)}</time>
      </Definition>
      <Definition label="Remaining term" mono>
        {remainingDays >= 0 ? `${remainingDays} days` : 'Expired'}
      </Definition>
      <Definition label="Broker of record">{lease.brokerOfRecord}</Definition>
      <Definition label="Property manager">{lease.propertyManager}</Definition>
      <Definition label="Last updated" mono>
        {formatDate(lease.updatedAt)} by {lease.updatedBy}
      </Definition>
    </dl>
  );
}

function formatDateLongToday(): string {
  return new Date().toISOString().slice(0, 10);
}
