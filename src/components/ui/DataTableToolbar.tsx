'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DataTableSearch({
  value,
  onChange,
  entityLabel,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  entityLabel: string;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        type="search"
        role="searchbox"
        aria-label={`Search ${entityLabel}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 w-64 rounded-md border border-slate-300 bg-white pl-8 pr-8 text-sm text-navy-900 placeholder:text-slate-400',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function DataTableFilterSelect({
  header,
  value,
  options,
  onChange,
}: {
  header: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (next: string) => void;
}) {
  return (
    <select
      aria-label={`Filter by ${header}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-navy-900',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700',
      )}
    >
      <option value="">All {header}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
