import { ReportsView } from './_components/ReportsView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Reports & Exports',
  description:
    'Portfolio rent rolls, critical date reports, obligation schedules, and export generation.',
  path: '/reports',
});

export default function ReportsPage() {
  return <ReportsView />;
}
