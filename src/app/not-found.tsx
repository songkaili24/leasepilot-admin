import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <EmptyState
        title="Page not found (404)"
        description="The page you requested does not exist, or the lease record may have been archived."
        action={
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to dashboard
              </Button>
            </Link>
            <Link href="/leases">
              <Button size="sm">Browse all leases</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
