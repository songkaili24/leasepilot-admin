import { DocumentsView } from './_components/DocumentsView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Documents Vault',
  description:
    'Executed lease agreements, amendments, estoppels, SNDAs, and certificates of insurance for every lease.',
  path: '/documents',
});

export default function DocumentsPage() {
  return <DocumentsView />;
}
