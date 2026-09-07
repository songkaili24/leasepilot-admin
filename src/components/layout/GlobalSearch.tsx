'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, FileText, MapPin, Search } from 'lucide-react';
import { searchEverything, type SearchHit } from '@/lib/search';
import { cn } from '@/lib/utils';

/**
 * Global search over leases, tenants, and properties. Debounced substring
 * matching with full keyboard support: ArrowUp/Down to move, Enter to open,
 * Escape to dismiss. Focusable via ⌘K / Ctrl+K from anywhere on the page.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (query.trim().length < 2) {
        setHits([]);
        return;
      }
      // Simulates request cancellation for when this moves to the API layer.
      controller.abort();
      setHits(searchEverything(query));
    }, 120);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

  function openHit(hit: SearchHit) {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    router.push(hit.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && hits[activeIndex]) {
      event.preventDefault();
      openHit(hits[activeIndex]);
    }
  }

  const kindIcon = (kind: SearchHit['kind']) =>
    kind === 'Property' ? (
      <Building2 aria-hidden className="h-4 w-4 text-slate-400" />
    ) : kind === 'Tenant' ? (
      <FileText aria-hidden className="h-4 w-4 text-slate-400" />
    ) : (
      <MapPin aria-hidden className="h-4 w-4 text-slate-400" />
    );

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls="global-search-results"
          aria-label="Search leases, tenants, and properties"
          placeholder="Search leases, tenants, properties…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'h-9 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-14 text-sm text-navy-900 placeholder:text-slate-400',
            'transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
          )}
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:block">
          ⌘K
        </kbd>
      </div>
      {open && query.trim().length >= 2 ? (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-md border border-slate-200 bg-white shadow-popover"
        >
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No matches for “{query}”.</p>
          ) : (
            <ul role="list" className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {hits.map((hit, index) => (
                <li key={hit.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openHit(hit)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      index === activeIndex ? 'bg-slate-50' : 'bg-white',
                    )}
                  >
                    {kindIcon(hit.kind)}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-navy-900">
                        {hit.label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{hit.sublabel}</span>
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {hit.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
