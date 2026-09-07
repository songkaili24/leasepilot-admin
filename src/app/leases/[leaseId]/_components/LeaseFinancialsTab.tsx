import { TableSkeleton } from '@/components/ui/Skeleton';
import { obligationsForLease, rentScheduleForLease } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import { formatCurrency, formatPct } from '@/lib/format';
import type { Lease } from '@/lib/types';

/**
 * Financial Obligations tab: escalating rent schedule plus the recurring
 * obligation summary (CAM, taxes, insurance, escrow).
 */
export function LeaseFinancialsTab({ lease }: { lease: Lease }) {
  const schedule = rentScheduleForLease(lease);

  return (
    <div className="space-y-6">
      <section aria-labelledby="rent-schedule-heading">
        <h2 id="rent-schedule-heading" className="text-sm font-semibold text-navy-900">
          Base rent schedule
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Contractual escalation ladder per Section 4.1 — {formatPct(lease.annualEscalationPct)} on
          each lease-year anniversary.
        </p>
        {schedule.length === 0 ? (
          <div className="mt-3">
            <TableSkeleton rows={3} />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[38rem] text-sm">
              <caption className="sr-only">Base rent schedule for {lease.leaseNumber}</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2">
                    Lease year
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Period
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Monthly rent
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Annual rent
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Escalation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((row) => (
                  <tr key={row.leaseYear}>
                    <td className="px-4 py-2.5 font-medium">{row.leaseYear}</td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">
                      {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                      {formatCurrency(row.monthlyRent)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                      {formatCurrency(row.annualRent)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-600">
                      {row.escalationPct > 0 ? `+${formatPct(row.escalationPct)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="recurring-heading">
        <h2 id="recurring-heading" className="text-sm font-semibold text-navy-900">
          Recurring obligations
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          CAM, tax, and insurance pass-throughs abstracted from the lease. Amounts reconcile
          annually against actuals.
        </p>
        <ObligationMiniTable leaseId={lease.id} />
      </section>
    </div>
  );
}

function ObligationMiniTable({ leaseId }: { leaseId: string }) {
  const rows = obligationsForLease(leaseId);

  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[32rem] text-sm">
        <caption className="sr-only">Recurring financial obligations</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-4 py-2">
              Category
            </th>
            <th scope="col" className="px-4 py-2 text-right">
              Annual
            </th>
            <th scope="col" className="px-4 py-2">
              Frequency
            </th>
            <th scope="col" className="px-4 py-2 text-right">
              Escalation
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-2.5 font-medium">{row.category}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                {formatCurrency(row.annualAmount)}
              </td>
              <td className="px-4 py-2.5 text-slate-600">{row.frequency}</td>
              <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-600">
                {row.escalationPct > 0 ? `+${formatPct(row.escalationPct)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
