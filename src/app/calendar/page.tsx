import { CriticalDatesView } from './_components/CriticalDatesView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Critical Dates Calendar',
  description:
    'Every lease-critical date across the portfolio — renewals, escalations, reconciliations, and certificate deadlines.',
  path: '/calendar',
});

export default function CriticalDatesPage() {
  return <CriticalDatesView />;
}
