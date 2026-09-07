import Link from 'next/link';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import { Button, LeaseStatusBadge } from '@/components/ui';
import { propertyById } from '@/lib/data';
import type { Lease } from '@/lib/types';
import { LeaseTabs } from './LeaseTabs';
import { LeaseDatesTab } from './LeaseDatesTab';
import { LeaseDocumentsTab } from './LeaseDocumentsTab';
import { LeaseFinancialsTab } from './LeaseFinancialsTab';
import { LeaseOverviewTab } from './LeaseOverviewTab';
import { QuickFactsPanel } from './QuickFactsPanel';
import { LeaseNotesTab } from './LeaseNotesTab';

/** Full lease detail: header, action buttons, section tabs, and quick-facts rail. */
export function LeaseDetail({ lease }: { lease: Lease }) {
  const property = propertyById(lease.propertyId);

  return (
    <>
      <div className="mb-4">
        <Link
          href="/leases"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          All leases
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-navy-900">
              {lease.tenantName}
            </h1>
            <LeaseStatusBadge status={lease.status} />
          </div>
          <p className="mt-1 font-mono text-sm tabular-nums text-slate-500">
            {lease.leaseNumber} · Suite {lease.suite}, {property?.name} · {property?.city},{' '}
            {property?.state}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            trailingIcon={<Download aria-hidden className="h-4 w-4 text-slate-400" />}
          >
            Export PDF
          </Button>
          <Button size="sm" trailingIcon={<Pencil aria-hidden className="h-4 w-4 text-teal-200" />}>
            Edit abstract
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <LeaseTabs
            lease={lease}
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'dates', label: 'Critical Dates' },
              { id: 'financials', label: 'Financial Obligations' },
              { id: 'documents', label: 'Documents' },
              { id: 'notes', label: 'Notes' },
            ]}
            panels={{
              overview: <LeaseOverviewTab lease={lease} />,
              dates: <LeaseDatesTab lease={lease} />,
              financials: <LeaseFinancialsTab lease={lease} />,
              documents: <LeaseDocumentsTab lease={lease} />,
              notes: <LeaseNotesTab lease={lease} />,
            }}
          />
        </div>
        <div className="xl:sticky xl:top-20 xl:self-start">
          <QuickFactsPanel lease={lease} />
        </div>
      </div>
    </>
  );
}
