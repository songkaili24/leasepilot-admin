import { Building2, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Info } from 'lucide-react';
import { propertyById } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import { formatArea, formatCurrency, formatPct, formatRate } from '@/lib/format';
import type { Lease } from '@/lib/types';

const rowClasses = 'flex items-baseline justify-between gap-3 py-2';
const rowLabel = 'text-xs font-medium text-slate-500';
const rowValue = 'text-right text-sm font-medium text-navy-900';
const monoValue = 'text-right font-mono text-sm font-medium tabular-nums text-navy-900';

/** Right-hand quick facts panel: contacts, building details, key economics. */
export function QuickFactsPanel({ lease }: { lease: Lease }) {
  const property = propertyById(lease.propertyId);

  return (
    <aside
      aria-label="Quick facts"
      className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm"
    >
      <section aria-labelledby="qf-contacts">
        <h2
          id="qf-contacts"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Property manager
        </h2>
        <div className="mt-2 space-y-1.5 text-sm">
          <p className="font-medium text-navy-900">{lease.propertyManager}</p>
          <p className="flex items-center gap-2 text-xs text-slate-600">
            <Phone aria-hidden className="h-3.5 w-3.5 text-slate-400" />
            <a
              href={`tel:${lease.propertyManagerContact.phone.replace(/[^\d+]/g, '')}`}
              className="font-mono tabular-nums underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              {lease.propertyManagerContact.phone}
            </a>
          </p>
          <p className="flex items-center gap-2 text-xs text-slate-600">
            <Mail aria-hidden className="h-3.5 w-3.5 text-slate-400" />
            <a
              href={`mailto:${lease.propertyManagerContact.email}`}
              className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              {lease.propertyManagerContact.email}
            </a>
          </p>
        </div>
      </section>

      <section aria-labelledby="qf-building" className="border-t border-slate-100 pt-3">
        <h2
          id="qf-building"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Building
        </h2>
        <div className="mt-2 flex items-start gap-2 text-sm">
          <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <p className="font-medium text-navy-900">{property?.name}</p>
            <p className="text-xs text-slate-500">
              {property?.address}, {property?.city}, {property?.state} {property?.postalCode}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {property?.type} · built {property?.yearBuilt} ·{' '}
              {formatArea(property?.grossFloorAreaSf ?? 0)} GFA
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="qf-economics" className="border-t border-slate-100 pt-3">
        <h2
          id="qf-economics"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Key economics
        </h2>
        <dl className="mt-1 divide-y divide-slate-100">
          <div className={rowClasses}>
            <dt className={rowLabel}>Base rent / mo</dt>
            <dd className={monoValue}>{formatCurrency(lease.baseRentMonthly)}</dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>
              <Tooltip
                content="Annual Base Rent divided by rentable square feet."
                className="align-text-bottom"
              >
                <span tabIndex={-1} aria-label="About effective rate">
                  <Info aria-hidden className="h-3 w-3 text-slate-400" />
                </span>
              </Tooltip>{' '}
              Effective rate
            </dt>
            <dd className={monoValue}>
              {formatRate((lease.baseRentMonthly * 12) / lease.rentableSf)} / SF
            </dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Annual escalation</dt>
            <dd className={monoValue}>{formatPct(lease.annualEscalationPct)}</dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Security deposit</dt>
            <dd className={monoValue}>{formatCurrency(lease.securityDeposit)}</dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>CAM recovery / yr</dt>
            <dd className={monoValue}>{formatCurrency(lease.camRecoveryAnnual)}</dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Commencement</dt>
            <dd className={rowValue}>
              <time dateTime={lease.commencementDate}>{formatDate(lease.commencementDate)}</time>
            </dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Expiration</dt>
            <dd className={rowValue}>
              <time dateTime={lease.expirationDate}>{formatDate(lease.expirationDate)}</time>
            </dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Renewal options</dt>
            <dd className={rowValue}>
              {lease.renewalOptions.length === 0 ? (
                'None'
              ) : (
                <Badge tone="navy">{lease.renewalOptions.length}</Badge>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="qf-use" className="border-t border-slate-100 pt-3">
        <h2 id="qf-use" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Permitted use
        </h2>
        <p className="mt-1.5 text-sm leading-snug text-slate-600">{lease.permittedUse}</p>
      </section>

      <section aria-labelledby="qf-parties" className="border-t border-slate-100 pt-3">
        <h2
          id="qf-parties"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Parties
        </h2>
        <dl className="mt-1 divide-y divide-slate-100">
          <div className={rowClasses}>
            <dt className={rowLabel}>Broker of record</dt>
            <dd className={rowValue}>{lease.brokerOfRecord}</dd>
          </div>
          <div className={rowClasses}>
            <dt className={rowLabel}>Last updated</dt>
            <dd className={rowValue}>
              {formatDate(lease.updatedAt)} · {lease.updatedBy}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
