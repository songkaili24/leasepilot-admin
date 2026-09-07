'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { portfolios } from '@/lib/data';
import { cn } from '@/lib/utils';

const ALL_PORTFOLIOS = { id: 'all', name: 'All Portfolios', code: 'ALL', propertyCount: 0 };

/** Portfolio selector — filters the working dataset. Persisted to localStorage. */
export function PortfolioSelect() {
  const [selected, setSelected] = useState(ALL_PORTFOLIOS);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('lv-portfolio');
    if (stored) {
      const match = [ALL_PORTFOLIOS, ...portfolios].find((p) => p.id === stored);
      if (match) setSelected(match);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(portfolio: typeof selected) {
    setSelected(portfolio);
    window.localStorage.setItem('lv-portfolio', portfolio.id);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 transition-colors',
          'hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
        )}
      >
        <MapPin aria-hidden className="h-4 w-4 text-slate-400" />
        <span className="hidden max-w-[12rem] truncate md:inline">{selected.name}</span>
        <span className="max-w-[4rem] truncate md:hidden">{selected.code}</span>
        <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 text-slate-400" />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Select portfolio"
          className="absolute right-0 top-full z-40 mt-1.5 w-64 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-popover"
        >
          {[ALL_PORTFOLIOS, ...portfolios].map((portfolio) => (
            <li key={portfolio.id} role="option" aria-selected={portfolio.id === selected.id}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => choose(portfolio)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                  portfolio.id === selected.id ? 'font-medium text-navy-900' : 'text-slate-600',
                )}
              >
                <span className="truncate">{portfolio.name}</span>
                {portfolio.id === selected.id ? (
                  <Check aria-hidden className="h-4 w-4 shrink-0 text-teal-700" />
                ) : (
                  <span className="font-mono text-[10px] text-slate-400">{portfolio.code}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
