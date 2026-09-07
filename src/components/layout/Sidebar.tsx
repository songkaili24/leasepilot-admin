'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LineChart,
  Settings,
  Vault,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { allUpcomingDates } from '@/lib/search';
import { obligations } from '@/lib/data';
import { severityFor } from '@/lib/alerts';

const NAV_SECTIONS: Array<{
  heading: string;
  items: Array<{
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
    countKey?: 'critical' | 'obligations' | 'documents';
  }>;
}> = [
  {
    heading: 'Portfolio',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/leases', label: 'All Leases', icon: FileText, countKey: 'documents' },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { href: '/calendar', label: 'Critical Dates', icon: CalendarClock, countKey: 'critical' },
      {
        href: '/financials',
        label: 'Financial Obligations',
        icon: Banknote,
        countKey: 'obligations',
      },
      { href: '/documents', label: 'Documents Vault', icon: Vault },
    ],
  },
  {
    heading: 'Insights',
    items: [
      { href: '/reports', label: 'Reports & Exports', icon: LineChart },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Badge counts derived from the live dataset (overdue dates, past-due obligations). */
function useNavCounts(): Record<string, { count: number; urgent: boolean }> {
  const counts: Record<string, { count: number; urgent: boolean }> = {};

  const upcoming = allUpcomingDates();
  const urgentDates = upcoming.filter((d) => severityFor(d.dueDate) === 'red').length;
  counts['critical'] = { count: upcoming.length, urgent: urgentDates > 0 };

  const overdueObligations = obligations.filter((o) => o.nextDueDate < toISOToday()).length;
  counts['obligations'] = { count: obligations.length, urgent: overdueObligations > 0 };

  return counts;
}

function toISOToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const counts = useNavCounts();

  return (
    <nav aria-label="Primary" className="flex h-full flex-col px-3 py-4">
      <ul role="list" className="flex-1 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <li key={section.heading}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.heading}
            </p>
            <ul role="list" className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const count = item.countKey ? counts[item.countKey] : undefined;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
                        active
                          ? 'bg-navy-800 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
                      )}
                    >
                      <Icon
                        aria-hidden
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-teal-300' : 'text-slate-400 group-hover:text-slate-500',
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count ? (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 font-mono text-[11px] tabular-nums leading-none',
                            count.urgent
                              ? 'bg-red-600 text-white'
                              : active
                                ? 'bg-navy-700 text-slate-200'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                          )}
                        >
                          {count.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
