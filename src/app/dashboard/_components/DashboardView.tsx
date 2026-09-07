import Link from 'next/link';
import { Banknote, CalendarClock, FileSignature, History, Upload } from 'lucide-react';
import { OccupancyChart } from '@/components/charts/OccupancyChart';
import { DaysRemainingBadge } from '@/components/ui/DaysRemainingBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { AbstractWizardButton } from '@/components/layout/AbstractWizardButton';
import { StatCard, Timeline } from '@/components/ui';
import {
  activityEvents,
  criticalDates,
  leaseById,
  leases,
  occupancyHistory,
  properties,
} from '@/lib/data';
import { severityFor } from '@/lib/alerts';
import { diffInDays, formatRelativeDue, isSameMonth, timeAgo, toISODate } from '@/lib/dates';
import { formatArea, formatNumber } from '@/lib/format';
import type { ActivityEvent, ActivityKind } from '@/lib/types';

const cardClasses = 'rounded-md border border-slate-200 bg-white shadow-sm';
const outlineButton =
  'inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-navy-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700';

const KIND_META: Record<ActivityKind, { icon: typeof Upload; chip: string }> = {
  Amendment: { icon: FileSignature, chip: 'bg-teal-50 text-teal-700' },
  Document: { icon: Upload, chip: 'bg-navy-50 text-navy-700' },
  Status: { icon: History, chip: 'bg-amber-50 text-amber-700' },
  Payment: { icon: Banknote, chip: 'bg-slate-100 text-slate-600' },
  Deadline: { icon: CalendarClock, chip: 'bg-red-50 text-red-700' },
};

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ol role="list" className="divide-y divide-slate-100">
      {events.map((event) => {
        const lease = leaseById(event.leaseId);
        const meta = KIND_META[event.kind];
        const Icon = meta.icon;
        return (
          <li key={event.id} className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-navy-900">{event.summary}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {lease ? `${lease.leaseNumber} · ${lease.tenantName} · ` : ''}
                {event.actor}
              </p>
            </div>
            <time
              dateTime={event.at}
              title={event.at}
              className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400"
            >
              {timeAgo(event.at)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

export function DashboardView() {
  const today = toISODate(new Date());

  const activeLeases = leases.filter((l) => l.status === 'Active');
  const expiring90 = leases
    .filter((l) => {
      const days = diffInDays(today, l.expirationDate);
      return (l.status === 'Expiring' || l.status === 'Active') && days >= 0 && days <= 90;
    })
    .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
  const pendingRenewals = leases.filter((l) =>
    l.renewalOptions.some((option) => {
      const days = diffInDays(today, option.noticeDeadline);
      return days >= 0 && days <= 180;
    }),
  );
  const totalSf = leases
    .filter((l) => l.status !== 'Terminated')
    .reduce((sum, l) => sum + l.rentableSf, 0);

  const monthDates = criticalDates
    .filter((d) => isSameMonth(d.dueDate, new Date()))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const latest = occupancyHistory[occupancyHistory.length - 1];
  const previous = occupancyHistory[occupancyHistory.length - 2];
  const occupancyDelta = latest && previous ? latest.occupancy - previous.occupancy : 0;

  return (
    <>
      <PageHeader
        title="Portfolio Dashboard"
        description={`${formatNumber(leases.length)} lease abstracts across ${properties.length} properties · data as of ${today}`}
        actions={
          <>
            <AbstractWizardButton size="md" />
            <Link href="/reports" className={outlineButton}>
              Generate Report
            </Link>
            <Link href="/calendar" className={outlineButton}>
              Calendar View
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Active Leases"
          value={formatNumber(activeLeases.length)}
          subvalue={`${formatNumber(leases.length)} abstracts on file`}
          hint="Leases in Active status. Expiring, renewed, and terminated records tracked separately."
        />
        <StatCard
          label="Expiring in 90 Days"
          value={formatNumber(expiring90.length)}
          subvalue={
            expiring90[0]
              ? `Next: ${expiring90[0].tenantName} — ${formatRelativeDue(expiring90[0].expirationDate)}`
              : 'None'
          }
          hint="Leases whose primary term ends within 90 days, including holdover candidates."
        />
        <StatCard
          label="Pending Renewals"
          value={formatNumber(pendingRenewals.length)}
          subvalue="Option notices due ≤ 180 days"
          hint="Leases with an unexercised renewal option whose notice deadline falls within 180 days."
        />
        <StatCard
          label="Total Square Footage"
          value={formatArea(totalSf)}
          subvalue={`${formatNumber(properties.length)} properties`}
          hint="Aggregate rentable square feet across non-terminated lease abstracts."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className={`${cardClasses} xl:col-span-3`} aria-labelledby="occupancy-heading">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 id="occupancy-heading" className="text-sm font-semibold text-navy-900">
              Portfolio occupancy
            </h2>
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-sm font-semibold tabular-nums text-navy-900">
                {latest ? `${latest.occupancy.toFixed(1)}%` : '—'}
              </span>
              <span
                className={
                  occupancyDelta >= 0 ? 'font-medium text-teal-700' : 'font-medium text-red-700'
                }
              >
                {occupancyDelta >= 0 ? '+' : ''}
                {occupancyDelta.toFixed(1)} pts m/m
              </span>
            </p>
          </div>
          <div className="px-4 py-4">
            <OccupancyChart points={occupancyHistory} />
          </div>
        </section>

        <section className={`${cardClasses} xl:col-span-2`} aria-labelledby="dates-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 id="dates-heading" className="text-sm font-semibold text-navy-900">
              Critical dates — {monthLabel}
            </h2>
            <Link
              href="/calendar"
              className="text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Open calendar
            </Link>
          </div>
          <div className="px-4 py-4">
            {monthDates.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No critical dates fall in {monthLabel}.
              </p>
            ) : (
              <Timeline
                items={monthDates.slice(0, 7).map((date) => {
                  const lease = leaseById(date.leaseId);
                  const severity = severityFor(date.dueDate);
                  return {
                    id: date.id,
                    date: date.dueDate,
                    title: date.type,
                    meta: lease ? `${lease.tenantName} · ${lease.leaseNumber}` : undefined,
                    tone: severity === 'red' ? 'red' : severity === 'amber' ? 'amber' : 'teal',
                  };
                })}
              />
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <section className={`${cardClasses} xl:col-span-3`} aria-labelledby="activity-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 id="activity-heading" className="text-sm font-semibold text-navy-900">
              Recent activity
            </h2>
            <p className="text-xs text-slate-400">Amendments · uploads · status changes</p>
          </div>
          <ActivityFeed events={activityEvents.slice(0, 9)} />
        </section>

        <section className={`${cardClasses} xl:col-span-2`} aria-labelledby="expiring-heading">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 id="expiring-heading" className="text-sm font-semibold text-navy-900">
              Expiring within 90 days
            </h2>
            <Link
              href="/leases"
              className="text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              All leases
            </Link>
          </div>
          <ul role="list" className="divide-y divide-slate-100">
            {expiring90.map((lease) => (
              <li key={lease.id}>
                <Link
                  href={`/leases/${lease.id}`}
                  className="focus-visible:outline-offset--2 flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{lease.tenantName}</p>
                    <p className="font-mono text-xs tabular-nums text-slate-500">
                      {lease.leaseNumber} · expires {lease.expirationDate}
                    </p>
                  </div>
                  <DaysRemainingBadge dueDate={lease.expirationDate} today={today} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
