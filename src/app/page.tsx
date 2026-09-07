import { DashboardView } from './_components/DashboardView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Dashboard',
  description:
    'Portfolio-wide lease health: active abstracts, expiring terms, and critical dates requiring action.',
  path: '/',
});

export default function DashboardPage() {
  return <DashboardView />;
}
