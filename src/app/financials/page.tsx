import { FinancialsView } from './_components/FinancialsView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Financial Obligations',
  description:
    'Base rent, CAM, taxes, and every recurring financial obligation across the portfolio with due dates and escalations.',
  path: '/financials',
});

export default function FinancialsPage() {
  return <FinancialsView />;
}
