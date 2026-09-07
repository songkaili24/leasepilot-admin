import type { ReactNode } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';

/**
 * Re-mounts on every route navigation so list→detail (and back) transitions
 * replay the shared rise-and-fade. `template.tsx` (not `layout.tsx`) is
 * intentional: layouts persist across navigations, templates re-mount.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
