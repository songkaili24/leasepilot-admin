import { notFound } from 'next/navigation';
import { leaseById, leases } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { LeaseDetail } from './_components/LeaseDetail';

interface LeasePageProps {
  params: { leaseId: string };
}

export function generateStaticParams() {
  return leases.map((lease) => ({ leaseId: lease.id }));
}

export function generateMetadata({ params }: LeasePageProps) {
  const lease = leaseById(params.leaseId);
  if (!lease)
    return pageMetadata({
      title: 'Lease not found',
      description: 'This lease record does not exist.',
      path: '/leases',
    });
  return pageMetadata({
    title: `${lease.leaseNumber} — ${lease.tenantName}`,
    description: `Lease abstract for ${lease.tenantName}: rentable area, base rent, escalations, critical dates, and documents.`,
    path: `/leases/${lease.id}`,
  });
}

export default function LeasePage({ params }: LeasePageProps) {
  const lease = leaseById(params.leaseId);
  if (!lease) notFound();
  return <LeaseDetail lease={lease} />;
}
