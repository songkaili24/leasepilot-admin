import { Badge } from '@/components/ui/Badge';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';
import { clausesForLease } from '@/lib/data';
import { formatDate, formatRelativeDue } from '@/lib/dates';
import { formatArea, formatCurrency, formatPct, formatRate } from '@/lib/format';
import type { Lease } from '@/lib/types';

const definitionClasses = 'text-xs font-medium text-slate-500';
const valueClasses = 'mt-0.5 text-sm font-medium text-navy-900';
const monoValueClasses = 'mt-0.5 font-mono text-sm font-medium tabular-nums text-navy-900';

function Definition({
  label,
  mono = false,
  wide = false,
  children,
}: {
  label: string;
  mono?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-3' : undefined}>
      <dt className={definitionClasses}>{label}</dt>
      <dd className={mono ? monoValueClasses : valueClasses}>{children}</dd>
    </div>
  );
}

/** Overview tab: key terms summary, renewal options, and headline clauses. */
export function LeaseOverviewTab({ lease }: { lease: Lease }) {
  const yearsRemaining = Math.max(
    0,
    Math.round(((Date.parse(lease.expirationDate) - Date.now()) / (365.25 * 86_400_000)) * 10) / 10,
  );

  return (
    <div className="space-y-6">
      <section aria-labelledby="terms-heading">
        <h2 id="terms-heading" className="text-sm font-semibold text-navy-900">
          Key terms
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Definition label="Lease number" mono>
            {lease.leaseNumber}
          </Definition>
          <Definition label="Rentable area" mono>
            {formatArea(lease.rentableSf)}
          </Definition>
          <Definition label="Remaining term" mono>
            {yearsRemaining > 0 ? `${yearsRemaining.toFixed(1)} yrs` : 'Expired'}
          </Definition>
          <Definition label="Commencement">
            <time dateTime={lease.commencementDate}>{formatDate(lease.commencementDate)}</time>
          </Definition>
          <Definition label="Expiration">
            <time dateTime={lease.expirationDate}>{formatDate(lease.expirationDate)}</time>
          </Definition>
          <Definition label="Base rent (monthly)" mono>
            {formatCurrency(lease.baseRentMonthly)}
          </Definition>
          <Definition label="Effective rate" mono>
            {formatRate((lease.baseRentMonthly * 12) / lease.rentableSf)} / SF
          </Definition>
          <Definition label="Annual escalation" mono>
            {formatPct(lease.annualEscalationPct)}
          </Definition>
          <Definition label="Security deposit" mono>
            {formatCurrency(lease.securityDeposit)}
          </Definition>
          <Definition label="Permitted use" wide>
            {lease.permittedUse}
          </Definition>
        </dl>
      </section>

      <section aria-labelledby="options-heading">
        <h2 id="options-heading" className="text-sm font-semibold text-navy-900">
          Renewal options
        </h2>
        {lease.renewalOptions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No renewal options. The tenancy concludes at the end of the primary term.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">Renewal options for {lease.leaseNumber}</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2">
                    Option
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Notice deadline
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Window
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Renewed term
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lease.renewalOptions.map((option) => (
                  <tr key={option.option}>
                    <td className="px-4 py-2.5 font-medium">Option {option.option}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                      {formatDate(option.noticeDeadline)}
                    </td>
                    <td className="px-4 py-2.5">
                      <DaysRemainingBadge dueDate={option.noticeDeadline} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                      {option.termYears} years
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="clauses-heading">
        <h2 id="clauses-heading" className="text-sm font-semibold text-navy-900">
          Headline clauses
        </h2>
        <ul role="list" className="mt-3 space-y-3">
          {clausesForLease(lease).map((clause) => (
            <li key={clause.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-navy-900">
                  Section {clause.section} — {clause.title}
                </p>
                <Badge tone="slate">Page {clause.page}</Badge>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{clause.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
