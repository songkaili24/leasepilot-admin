'use client';

import { Button } from '@/components/ui/Button';
import type { LeaseStatus } from '@/lib/types';
import { formatNumber } from '@/lib/format';

export interface LeaseFilterState {
  statuses: Set<LeaseStatus>;
  propertyId: string;
  rentMin: string;
  rentMax: string;
}

const STATUS_OPTIONS: LeaseStatus[] = ['Active', 'Expiring', 'Renewed', 'Terminated'];

const labelClasses = 'text-xs font-semibold uppercase tracking-wide text-slate-500';
const inputClasses =
  'h-8 w-full rounded-md border border-slate-300 bg-white px-2 font-mono text-xs tabular-nums text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';

/** Left filter rail for the lease list. Stacks above the table on small screens. */
export function LeaseFilterSidebar({
  filters,
  onFiltersChange,
  propertyOptions,
  resultCount,
  totalCount,
}: {
  filters: LeaseFilterState;
  onFiltersChange: (next: LeaseFilterState) => void;
  propertyOptions: Array<{ id: string; label: string }>;
  resultCount: number;
  totalCount: number;
}) {
  const { statuses, propertyId, rentMin, rentMax } = filters;

  const hasActiveFilters =
    statuses.size !== STATUS_OPTIONS.length ||
    propertyId !== 'all' ||
    rentMin !== '' ||
    rentMax !== '';

  function toggleStatus(status: LeaseStatus) {
    const next = new Set(statuses);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    onFiltersChange({ ...filters, statuses: next });
  }

  return (
    <aside
      aria-label="Lease filters"
      className="space-y-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-navy-900">Filters</h2>
        {hasActiveFilters ? (
          <Button
            variant="outline"
            size="xs"
            onClick={() =>
              onFiltersChange({
                statuses: new Set(STATUS_OPTIONS),
                propertyId: 'all',
                rentMin: '',
                rentMax: '',
              })
            }
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <fieldset>
        <legend className={labelClasses}>Status</legend>
        <div className="mt-2 space-y-1.5">
          {STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2 text-sm text-navy-900"
            >
              <input
                type="checkbox"
                checked={statuses.has(status)}
                onChange={() => toggleStatus(status)}
                className="h-4 w-4 rounded border-slate-300 accent-teal-700"
              />
              {status}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClasses}>Property</legend>
        <select
          aria-label="Filter by property"
          value={propertyId}
          onChange={(e) => onFiltersChange({ ...filters, propertyId: e.target.value })}
          className="mt-2 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
        >
          <option value="all">All properties</option>
          {propertyOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset>
        <legend className={labelClasses}>Monthly rent range (USD)</legend>
        <div className="mt-2 flex items-center gap-2">
          <label className="sr-only" htmlFor="rent-min">
            Minimum monthly rent
          </label>
          <div className="relative flex-1">
            <span
              aria-hidden
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              $
            </span>
            <input
              id="rent-min"
              type="number"
              min={0}
              step={500}
              placeholder="Min"
              value={rentMin}
              onChange={(e) => onFiltersChange({ ...filters, rentMin: e.target.value })}
              className={`${inputClasses} pl-5`}
            />
          </div>
          <span aria-hidden className="text-xs text-slate-400">
            –
          </span>
          <label className="sr-only" htmlFor="rent-max">
            Maximum monthly rent
          </label>
          <div className="relative flex-1">
            <span
              aria-hidden
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              $
            </span>
            <input
              id="rent-max"
              type="number"
              min={0}
              step={500}
              placeholder="Max"
              value={rentMax}
              onChange={(e) => onFiltersChange({ ...filters, rentMax: e.target.value })}
              className={`${inputClasses} pl-5`}
            />
          </div>
        </div>
      </fieldset>

      <p aria-live="polite" className="border-t border-slate-100 pt-3 text-xs text-slate-500">
        Showing <span className="font-mono tabular-nums">{formatNumber(resultCount)}</span> of{' '}
        <span className="font-mono tabular-nums">{formatNumber(totalCount)}</span> leases
      </p>
    </aside>
  );
}
