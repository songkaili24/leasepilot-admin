import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Lightweight tooltip using the native `title` attribute plus a styled hover/
 * focus popover. The popover renders via CSS on hover and keyboard focus
 * (no portal, no JS), which keeps it cheap for dense table labels.
 */
export function Tooltip({
  content,
  side = 'top',
  children,
  className,
}: {
  content: string;
  side?: 'top' | 'bottom';
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('group/tt relative inline-flex items-center', className)} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none invisible absolute left-1/2 z-40 w-56 -translate-x-1/2 rounded-md bg-navy-900 px-2.5 py-1.5 text-xs font-normal leading-snug text-white opacity-0 shadow-md transition-opacity duration-150',
          'group-hover/tt:visible group-hover/tt:opacity-100 group-focus-visible/tt:visible group-focus-visible/tt:opacity-100',
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
        )}
      >
        {content}
      </span>
    </span>
  );
}
