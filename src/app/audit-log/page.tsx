import { AuditLogView } from './_components/AuditLogView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Audit Log',
  description:
    'Chronological record of every system action — sign-ins, abstract changes, document events, and administrative activity.',
  path: '/audit-log',
});

export default function AuditLogPage() {
  return <AuditLogView />;
}
