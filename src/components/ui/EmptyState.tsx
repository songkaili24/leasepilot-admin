import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
      </div>
      <p className="mt-3 text-sm font-semibold text-navy-900">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
