'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { Badge, Button, DataTable, Modal, StatCard } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { allDocuments } from '@/lib/search';
import { formatDate } from '@/lib/dates';
import type { DocumentRow } from '@/lib/search';

const KIND_TONES: Record<DocumentRow['kind'], 'navy' | 'teal' | 'amber' | 'slate'> = {
  'Lease Agreement': 'navy',
  Amendment: 'teal',
  Estoppel: 'amber',
  SNDA: 'amber',
  COI: 'slate',
  'Rent Roll': 'slate',
  Correspondence: 'slate',
};

export function DocumentsView() {
  const docs = useMemo(() => allDocuments(), []);
  const [viewerDoc, setViewerDoc] = useState<DocumentRow | null>(null);

  const agreements = docs.filter((d) => d.kind === 'Lease Agreement').length;
  const amendments = docs.filter((d) => d.kind === 'Amendment').length;
  const certificates = docs.filter((d) => d.kind === 'COI').length;

  return (
    <>
      <PageHeader
        title="Documents Vault"
        description="Versioned document record for every lease. Original agreements are retained immutable; amendments are stacked in order."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Executed Agreements"
          value={String(agreements)}
          subvalue="One original per lease"
          hint="Fully executed original lease agreements held in the vault."
        />
        <StatCard
          label="Amendments"
          value={String(amendments)}
          subvalue="Stacked on originals"
          hint="Amendments, renewals, and side letters that modify original terms."
        />
        <StatCard
          label="Certificates of Insurance"
          value={String(certificates)}
          subvalue="Tracked for renewal"
          hint="Tenant COIs on file. Expiring certificates trigger critical dates."
        />
      </div>

      <div className="mt-6">
        <DataTable
          ariaLabel="Vault documents"
          entityLabel="documents"
          rows={docs}
          getRowId={(doc) => doc.id}
          onRowClick={(doc) => setViewerDoc(doc)}
          searchPlaceholder="Search document name, tenant, lease number…"
          initialPageSize={25}
          columns={[
            {
              key: 'name',
              header: 'Document',
              accessor: (d) => d.name,
              sortable: true,
              render: (d) => (
                <div className="flex items-center gap-2.5">
                  <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="font-medium">{d.name}</span>
                </div>
              ),
            },
            {
              key: 'leaseNumber',
              header: 'Lease #',
              accessor: (d) => d.leaseNumber,
              sortable: true,
              render: (d) => (
                <Link
                  href={`/leases/${d.leaseId}`}
                  className="font-mono text-xs font-medium tabular-nums text-teal-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {d.leaseNumber}
                </Link>
              ),
            },
            {
              key: 'tenant',
              header: 'Tenant',
              accessor: (d) => d.tenantName,
              sortable: true,
            },
            {
              key: 'kind',
              header: 'Type',
              accessor: (d) => d.kind,
              sortable: true,
              filterOptions: Array.from(new Set(docs.map((d) => d.kind)))
                .sort()
                .map((k) => ({ label: k, value: k })),
              filterValue: (d) => d.kind,
              render: (d) => <Badge tone={KIND_TONES[d.kind]}>{d.kind}</Badge>,
            },
            {
              key: 'sizeKb',
              header: 'Size',
              align: 'right',
              accessor: (d) => d.sizeKb,
              sortable: true,
              render: (d) => (
                <span className="font-mono text-xs tabular-nums text-slate-600">
                  {(d.sizeKb / 1024).toFixed(1)} MB
                </span>
              ),
            },
            {
              key: 'pages',
              header: 'Pages',
              align: 'right',
              accessor: (d) => d.pages,
              sortable: true,
              render: (d) => (
                <span className="font-mono text-xs tabular-nums text-slate-600">{d.pages}</span>
              ),
            },
            {
              key: 'uploadedAt',
              header: 'Uploaded',
              accessor: (d) => d.uploadedAt,
              sortable: true,
              render: (d) => (
                <time
                  dateTime={d.uploadedAt}
                  className="font-mono text-xs tabular-nums text-slate-600"
                >
                  {formatDate(d.uploadedAt)}
                </time>
              ),
            },
          ]}
          mobileCard={(doc: DocumentRow) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-navy-900">{doc.name}</p>
                <Badge tone={KIND_TONES[doc.kind]}>{doc.kind}</Badge>
              </div>
              <p className="mt-0.5 font-mono text-xs tabular-nums text-slate-500">
                {doc.leaseNumber} · {doc.tenantName}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                v{doc.version} · {(doc.sizeKb / 1024).toFixed(1)} MB · {doc.pages} pages · uploaded{' '}
                {formatDate(doc.uploadedAt)}
              </p>
            </div>
          )}
        />
      </div>

      <Modal
        open={viewerDoc !== null}
        onClose={() => setViewerDoc(null)}
        size="lg"
        title={viewerDoc?.name ?? ''}
        description={
          viewerDoc
            ? `${viewerDoc.kind} · v${viewerDoc.version} · ${viewerDoc.pages} pages · ${(viewerDoc.sizeKb / 1024).toFixed(1)} MB`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setViewerDoc(null)}>
              Close
            </Button>
            <Button trailingIcon={<Download aria-hidden className="h-4 w-4 text-teal-200" />}>
              Download
            </Button>
          </>
        }
      >
        {viewerDoc ? (
          <div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-slate-500">Lease number</dt>
                <dd className="mt-0.5 font-mono text-xs font-medium tabular-nums text-navy-900">
                  {viewerDoc.leaseNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Tenant</dt>
                <dd className="mt-0.5 font-medium text-navy-900">{viewerDoc.tenantName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Uploaded</dt>
                <dd className="mt-0.5 font-mono text-xs tabular-nums text-navy-900">
                  {formatDate(viewerDoc.uploadedAt)} by {viewerDoc.uploadedBy}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50">
              <p className="text-sm text-slate-500">
                Watermarked viewer preview — the executed document streams from the vault.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
