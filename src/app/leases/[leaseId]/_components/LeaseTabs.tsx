import { Badge, Tabs, Timeline } from '@/components/ui';
import type { TabItem } from '@/components/ui/Tabs';
import { FileText } from 'lucide-react';
import {
  clausesForLease,
  criticalDatesForLease,
  documentsForLease,
  obligationsForLease,
  propertyById,
} from '@/lib/data';
import { formatDate, formatRelativeDue, toISODate } from '@/lib/dates';
import { formatCurrency } from '@/lib/format';
import type { Lease } from '@/lib/types';
import { LeaseFactsGrid } from './LeaseFactsGrid';

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Assembles the document-section tabs for the lease detail page. */
export function LeaseTabs({ lease }: { lease: Lease }) {
  const property = propertyById(lease.propertyId);
  const today = toISODate(new Date());
  const dates = criticalDatesForLease(lease.id);
  const leaseObligations = obligationsForLease(lease.id);
  const docs = documentsForLease(lease.id);
  const clauses = clausesForLease(lease);

  const tabs: TabItem[] = [
    {
      id: 'abstract',
      label: 'Abstract',
      content: <LeaseFactsGrid lease={lease} property={property} />,
    },
    {
      id: 'clauses',
      label: 'Clauses',
      count: clauses.length,
      content: (
        <ul role="list" className="space-y-3">
          {clauses.map((clause) => (
            <li key={clause.id} className="rounded-md border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-navy-900">
                  Section {clause.section} — {clause.title}
                </p>
                <span className="font-mono text-xs tabular-nums text-slate-400">
                  Page {clause.page}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{clause.excerpt}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'obligations',
      label: 'Financial obligations',
      count: leaseObligations.length,
      content: (
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">Financial obligations for {lease.leaseNumber}</caption>
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
                <th scope="col" className="px-4 py-2">
                  Next due
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaseObligations.map((obligation) => (
                <tr key={obligation.id}>
                  <td className="px-4 py-2.5 font-medium">{obligation.category}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                    {formatCurrency(obligation.annualAmount)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{obligation.frequency}</td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">
                    {formatDate(obligation.nextDueDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'dates',
      label: 'Critical dates',
      count: dates.length,
      content: (
        <Timeline
          items={dates.map((d) => ({
            id: d.id,
            date: d.dueDate,
            title: d.type,
            meta: d.notes,
            tone:
              d.dueDate < today
                ? ('red' as const)
                : d.dueDate <= addDaysISO(today, 90)
                  ? ('amber' as const)
                  : ('slate' as const),
          }))}
        />
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      count: docs.length,
      content: (
        <ul role="list" className="divide-y divide-slate-100 rounded-md border border-slate-200">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-900">{doc.name}</p>
                  <p className="text-xs text-slate-500">
                    {doc.kind} · v{doc.version} · {(doc.sizeKb / 1024).toFixed(1)} MB · {doc.pages}{' '}
                    pages · uploaded {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <Badge tone="slate">{doc.kind}</Badge>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'options',
      label: 'Renewal options',
      count: lease.renewalOptions.length,
      content:
        lease.renewalOptions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No renewal options. This tenancy concluded at the end of its primary term.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[32rem] text-sm">
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
                    Relative
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Term
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
                    <td className="px-4 py-2.5 text-xs text-slate-600">
                      {formatRelativeDue(option.noticeDeadline)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">
                      {option.termYears} years
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
    },
  ];

  return <Tabs items={tabs} />;
}
