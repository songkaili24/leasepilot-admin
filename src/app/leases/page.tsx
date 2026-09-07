import { LeasesView } from './_components/LeasesView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'All Leases',
  description:
    'Search, sort, and filter every commercial lease abstract across the portfolio — terms, rents, and status.',
  path: '/leases',
});

export default function LeasesPage() {
  return <LeasesView />;
}
