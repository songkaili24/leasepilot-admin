'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
        title="Something went wrong"
        description={
          error.digest
            ? `The request failed with reference ${error.digest}. Retry, or contact support if it persists.`
            : 'The request failed unexpectedly. Retry, or contact support if it persists.'
        }
        action={
          <Button size="sm" onClick={reset}>
            Retry
          </Button>
        }
      />
    </div>
  );
}
