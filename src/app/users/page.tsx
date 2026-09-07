import { UsersView } from './_components/UsersView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Users',
  description:
    'Role assignments, invitations, and the platform permission matrix for Admin, Property Manager, and Read-Only seats.',
  path: '/users',
});

export default function UsersPage() {
  return <UsersView />;
}
