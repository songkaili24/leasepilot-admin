import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Shared page transition wrapper: subtle rise-and-fade on route content.
 * Honors prefers-reduced-motion via the motion-safe variant.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('animate-page-in motion-reduce:animate-none', className)}>{children}</div>
  );
}
