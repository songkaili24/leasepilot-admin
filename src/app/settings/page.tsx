import { SettingsView } from './_components/SettingsView';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Settings',
  description:
    'Workspace configuration, alert thresholds, team roles, and notification preferences.',
  path: '/settings',
});

export default function SettingsPage() {
  return <SettingsView />;
}
