'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LeaseStatusBadge, StatCard, Timeline } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  criticalDates,
  leases,
  obligations,
  portfolioName,
  portfolios,
  properties,
} from '@/lib/data';
import { alertsFor } from '@/lib/alerts';
import { diffInDays, toISODate } from '@/lib/dates';
import { formatCurrency, formatNumber } from '@/lib/format';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';

function daysTone(days: number): string {
  if (days < 0) return 'text-red-700';
  if (days <= 30) return 'text-red-700';
  if (days <= 90) return 'text-amber-600';
  return 'text-slate-500';
}

export function DashboardView() {
  const today = toISODate(new Date());

  const activeLeases = leases.filter((l) => l.status === 'Active');
  const expiringLeases = leases.filter((l) => l.status === 'Expiring');
  const terminatedLeases = leases.filter((l) => l.status === 'Terminated');

  const annualBaseRent = leases
    .filter((l) => l.status !== 'Terminated')
    .reduce((sum, l) => sum + l.baseRentMonthly * 12, 0);

  const expiringWithin12Months = leases
    .filter(
      (l) =>
        l.status === 'Expiring' ||
        (l.status === 'Active' && diffInDays(today, l.expirationDate) <= 365),
    )
    .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));

  const alerts = alertsFor(leases, criticalDates);

  const redAlerts = alerts.filter((a) => a.severity === 'red');
  const amberAlerts = alerts.filter((a) => a.severity === 'amber');

  const timelineItems = alerts.slice(0, 6).map((alert) => ({
    id: alert.date.id,
    date: alert.date.dueDate,
    title: alert.date.type,
    meta: `${alert.lease.tenantName} · ${alert.lease.leaseNumber}`,
    tone: alert.severity === 'red' ? ('red' as const) : ('amber' as const),
  }));

  const overdueObligations = obligations.filter((o) => o.nextDueDate < today);
  const monthlyRunRate = obligations
    .filter((o) => o.frequency === 'Monthly')
    .reduce((sum, o) => sum + Math.round(o.annualAmount / 12), 0);

  return (
    <>
      <PageHeader
        title="Portfolio Dashboard"
        description={`${formatNumber(leases.length)} lease abstracts across ${properties.length} properties and ${portfolios.length} portfolios.`}
        actions={
          <Link
            href="/calendar"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-navy-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Critical dates calendar
            <ArrowRight aria-hidden className="h-4 w-4 text-slate-400" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Annualized Base Rent"
          value={formatCurrency(annualBaseRent)}
          subvalue={`${activeLeases.length + expiringLeases.length} rent-paying leases`}
          hint="Sum of monthly Base Rent × 12 for Active and Expiring leases. Excludes terminated terms and one-time charges."
        />
        <StatCard
          label="Expiring ≤ 12 Months"
          value={formatNumber(expiringWithin12Months.length)}
          subvalue="Renewal decisions required"
          hint="Leases in Expiring status plus Active leases whose primary term ends within 365 days."
        />
        <StatCard
          label="Dates Needing Action"
          value={formatNumber(redAlerts.length)}
          subvalue={`${amberAlerts.length} due within 90 days`}
          hint="Overdue items and critical dates falling within the 30-day red window."
        />
        <StatCard
          label="Obligations Overdue"
          value={formatNumber(overdueObligations.length)}
          subvalue={`Monthly run rate ${formatCurrency(monthlyRunRate)}`}
          hint="Financial obligations whose next due date has passed. Reconcile before period close."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className={cardClasses} aria-labelledby="expiring-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 id="expiring-heading" className="text-sm font-semibold text-navy-900">
              Expiring within 12 months
            </h2>
            <Link
              href="/leases"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              All leases
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2">
                    Tenant
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Term ends
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Days
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringWithin12Months.slice(0, 7).map((lease) => {
                  const days = diffInDays(today, lease.expirationDate);
                  return (
                    <tr key={lease.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2">
                        <Link
                          href={`/leases/${lease.id}`}
                          className="font-medium text-navy-900 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                        >
                          {lease.tenantName}
                        </Link>
                        <span className="block font-mono text-xs tabular-nums text-slate-500">
                          {lease.leaseNumber}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 font-mono text-xs tabular-nums text-slate-600">
                        {lease.expirationDate}
                      </td>
                      <td
                        className={`px-4 py-2 text-right font-mono text-xs font-semibold tabular-nums ${daysTone(days)}`}
                      >
                        {days < 0 ? `${days}` : `+${days}`}
                      </td>
                      <td className="px-4 py-2">
                        <LeaseStatusBadge status={lease.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={cardClasses} aria-labelledby="critical-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 id="critical-heading" className="text-sm font-semibold text-navy-900">
              Critical dates — action queue
            </h2>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Open calendar
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          <div className="px-4 py-4">
            <Timeline items={timelineItems} />
          </div>
        </section>

        <section className={cardClasses} aria-labelledby="portfolio-heading">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 id="portfolio-heading" className="text-sm font-semibold text-navy-900">
              Portfolio composition
            </h2>
          </div>
          <ul role="list" className="divide-y divide-slate-100">
            {portfolios.map((portfolio) => {
              const portfolioLeases = leases.filter((l) => l.portfolioId === portfolio.id);
              const portfolioABR = portfolioLeases
                .filter((l) => l.status !== 'Terminated')
                .reduce((sum, l) => sum + l.baseRentMonthly * 12, 0);
              const urgent = alerts.filter(
                (a) => a.lease.portfolioId === portfolio.id && a.severity === 'red',
              ).length;
              return (
                <li key={portfolio.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-navy-900">{portfolio.name}</p>
                    <p className="font-mono text-sm font-semibold tabular-nums text-navy-900">
                      {formatCurrency(portfolioABR)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {portfolio.propertyCount} properties ·{' '}
                    <span className="font-mono tabular-nums">{portfolioLeases.length}</span>{' '}
                    abstracts
                    {urgent > 0 ? (
                      <span className="ml-1.5 font-medium text-red-700">
                        · {urgent} urgent date{urgent === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </p>
                </li>
              );
            })}
            <li className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">Total obligations tracked</p>
                <p className="font-mono text-sm font-semibold tabular-nums text-slate-600">
                  {formatCurrency(obligations.reduce((sum, o) => sum + o.annualAmount, 0))}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {portfolioName('p-1')} and {portfolios.length - 1} other portfolio
                {portfolios.length === 2 ? '' : 's'}
              </p>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
