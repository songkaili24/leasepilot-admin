import { FileText, Download } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { documentsForLease } from '@/lib/data';
import { formatDate } from '@/lib/dates';
import type { Lease, VaultDocument } from '@/lib/types';

const KIND_TONES: Record<VaultDocument['kind'], 'navy' | 'teal' | 'amber' | 'slate'> = {
  'Lease Agreement': 'navy',
  Amendment: 'teal',
  Estoppel: 'amber',
  SNDA: 'amber',
  COI: 'slate',
  'Rent Roll': 'slate',
  Correspondence: 'slate',
};

/** Documents tab: versioned file cards for the executed lease and all exhibits. */
export function LeaseDocumentsTab({ lease }: { lease: Lease }) {
  const docs = documentsForLease(lease.id);

  if (docs.length === 0) {
    return <p className="text-sm text-slate-500">No documents filed for this lease yet.</p>;
  }

  return (
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
  );
}
