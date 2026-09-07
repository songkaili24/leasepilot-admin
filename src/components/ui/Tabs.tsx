'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  /** Optional count rendered after the label, e.g. "Clauses (5)". */
  count?: number;
  content: ReactNode;
}

/**
 * Accessible tabs per WAI-ARIA: roving tabindex, arrow-key navigation,
 * Home/End support, manual activation on Enter/Space.
 */
export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id);

  const activeIndex = Math.max(
    0,
    items.findIndex((t) => t.id === activeId),
  );
  const active = items[activeIndex];

  function onKeyDown(event: React.KeyboardEvent) {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (activeIndex + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (activeIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next !== null) {
      event.preventDefault();
      setActiveId(items[next].id);
      document.getElementById(`${baseId}-tab-${items[next].id}`)?.focus();
    }
  }

  if (!active) return null;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Document sections"
        onKeyDown={onKeyDown}
        className="flex gap-1 border-b border-slate-200"
      >
        {items.map((tab) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-offset--2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700',
                selected
                  ? 'border-teal-700 text-teal-800'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-navy-800',
              )}
            >
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span className="ml-1.5 font-mono text-xs text-slate-400">{tab.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div
        id={`${baseId}-panel-${active.id}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active.id}`}
        tabIndex={0}
        className="pt-4 focus-visible:outline-none"
      >
        {active.content}
      </div>
    </div>
  );
}
