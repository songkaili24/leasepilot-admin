'use client';

import { useState } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { documentsForLease } from '@/lib/data';
import { formatDate, formatDateTime } from '@/lib/dates';
import type { Lease, VaultDocument } from '@/lib/types';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';

const KIND_TONES: Record<VaultDocument['kind'], 'navy' | 'teal' | 'amber' | 'slate'> = {
  'Lease Agreement': 'navy',
  Amendment: 'teal',
  Estoppel: 'amber',
  SNDA: 'amber',
  COI: 'slate',
  'Rent Roll': 'slate',
  Correspondence: 'slate',
};

/** Documents tab: versioned file cards, PDF-only upload, and version increments. */
export function LeaseDocumentsTab({ lease }: { lease: Lease }) {
  const docs = documentsForLease(lease.id);
  const [uploads, setUploads] = useState<
    Array<{ name: string; version: string; at: string; sizeMb: number }>
  >([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const original = docs.find((d) => d.kind === 'Lease Agreement') ?? docs[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Executed originals are immutable; amendments and exhibits stack as new versions.
        </p>
        {original ? (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload aria-hidden className="h-4 w-4" />
            Upload document
          </Button>
        ) : null}
      </div>

      {uploads.length > 0 ? (
        <ul role="list" className="space-y-2">
          {uploads.map((upload, i) => (
            <li
              key={`${upload.name}-${i}`}
              className="flex flex-wrap items-center gap-2 rounded-md border border-teal-200 bg-teal-50/60 px-3 py-2 text-sm"
            >
              <Badge tone="teal">v{upload.version}</Badge>
              <span className="font-medium text-navy-900">{upload.name}</span>
              <span className="text-xs text-slate-500">
                {upload.sizeMb.toFixed(2)} MB · {formatDateTime(upload.at)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {docs.length === 0 ? (
        <p className="text-sm text-slate-500">No documents filed for this lease yet.</p>
      ) : (
        <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                  <FileText aria-hidden className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-navy-900">{doc.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(doc.sizeKb / 1024).toFixed(1)} MB · {doc.pages} pages · uploaded{' '}
                    {formatDate(doc.uploadedAt)} by {doc.uploadedBy}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Badge tone={KIND_TONES[doc.kind]}>v{doc.version}</Badge>
                <Button
                  variant="outline"
                  size="xs"
                  trailingIcon={<Download aria-hidden className="h-3.5 w-3.5 text-slate-400" />}
                >
                  Download
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        documentName={original?.name ?? lease.leaseNumber}
        existingVersions={docs.map((d) => d.version)}
      />
    </div>
  );
}
