'use client';

import { useRef, useState } from 'react';
import { FileUp, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { MAX_UPLOAD_MB, uploadFileError, nextVersionLabel } from '@/lib/validation';
import { formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/utils';

export interface UploadEntry {
  name: string;
  sizeMb: number;
  version: string;
  at: string;
}

/**
 * PDF-only document upload modal: validates extension and size against the
 * workspace policy and computes the next version label from the stack.
 */
export function DocumentUploadModal({
  open,
  onClose,
  documentName,
  existingVersions,
}: {
  open: boolean;
  onClose: () => void;
  documentName: string;
  existingVersions: string[];
}) {
  const [entry, setEntry] = useState<UploadEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextVersion = nextVersionLabel(existingVersions);

  function close() {
    onClose();
    window.setTimeout(() => {
      setEntry(null);
      setError(null);
      setDragActive(false);
    }, 150);
  }

  function acceptFile(file: { name: string; size: number }) {
    const problem = uploadFileError(file, true);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setEntry({
      name: file.name,
      sizeMb: file.size / (1024 * 1024),
      version: nextVersion,
      at: new Date().toISOString(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload document"
      description={`${documentName} — next version v${nextVersion} (PDF only, max ${MAX_UPLOAD_MB} MB)`}
      footer={
        entry ? (
          <>
            <Button variant="outline" onClick={() => setEntry(null)}>
              Choose another file
            </Button>
            <Button onClick={close}>
              <FileUp aria-hidden className="h-4 w-4" />
              Upload as v{nextVersion}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
        )
      }
    >
      {entry ? (
        <div className="rounded-md border border-teal-200 bg-teal-50/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-100 text-teal-700">
              <FileText aria-hidden className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-navy-900">{entry.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {entry.sizeMb.toFixed(2)} MB · will be filed as{' '}
                <span className="font-mono font-semibold">v{entry.version}</span> ·{' '}
                {formatDateTime(entry.at)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="teal" dot>
                  PDF validated
                </Badge>
                <Badge tone="navy" dot>
                  Version increment confirmed
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) acceptFile({ name: file.name, size: file.size });
            }}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
              dragActive
                ? 'border-teal-600 bg-teal-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100',
            )}
          >
            <FileUp aria-hidden className="h-6 w-6 text-slate-400" />
            <span className="text-sm font-medium text-navy-900">
              Drop the executed PDF here, or browse
            </span>
            <span className="text-xs text-slate-500">
              Scanned originals only — one file per version, {MAX_UPLOAD_MB} MB maximum
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="Select PDF document"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) acceptFile({ name: file.name, size: file.size });
              e.target.value = '';
            }}
          />
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          ) : null}
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
            Uploads are virus-scanned, watermarked on retrieval, and recorded in the audit log.
          </p>
        </div>
      )}
    </Modal>
  );
}
