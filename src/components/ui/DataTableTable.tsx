'use client';

import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';
import type { DataTableColumn } from './DataTable';
import type { ReactNode } from 'react';

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

interface DataTableTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  pageRows: T[];
  getRowId: (row: T) => string;
  sortState: SortState;
  /** Changes when the sort changes; keys the fade/slide animation on rows. */
  sortKey: string;
  onToggleSort: (column: DataTableColumn<T>) => void;
  interactive: boolean;
  onRowActivate: (row: T) => void;
  ariaLabel: string;
  selectable: boolean;
  selectedIds: ReadonlySet<string>;
  allPageSelected: boolean;
  onTogglePageSelection: (checked: boolean) => void;
  onToggleRowSelection: (rowId: string) => void;
  rowQuickActions?: (row: T) => ReactNode;
}

const checkboxClasses = 'h-4 w-4 rounded border-slate-300 accent-teal-700';

/** Sortable header + body rows. Presentational; state lives in DataTable. */
export function DataTableTable<T>({
  columns,
  pageRows,
  getRowId,
  sortState,
  sortKey,
  onToggleSort,
  interactive,
  onRowActivate,
  ariaLabel,
  selectable,
  selectedIds,
  allPageSelected,
  onTogglePageSelection,
  onToggleRowSelection,
  rowQuickActions,
}: DataTableTableProps<T>) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const somePageSelected = pageRows.some((row) => selectedIds.has(getRowId(row)));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = somePageSelected && !allPageSelected;
    }
  }, [somePageSelected, allPageSelected]);

  return (
    // The key on <tbody> remounts rows when the sort changes, replaying the
    // row-sort animation. Disabled states are handled in CSS (reduced motion).
    <table
      key={sortKey}
      className="w-full min-w-[56rem] border-collapse text-sm"
      aria-label={ariaLabel}
    >
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          {selectable ? (
            <th scope="col" className="w-10 px-3 py-2.5">
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                checked={allPageSelected}
                onChange={(e) => onTogglePageSelection(e.target.checked)}
                aria-label="Select all rows on this page"
                className={checkboxClasses}
              />
            </th>
          ) : null}
          {columns.map((column) => {
            const isSorted = sortState?.key === column.key;
            const ariaSort = isSorted
              ? sortState!.direction === 'asc'
                ? ('ascending' as const)
                : ('descending' as const)
              : undefined;
            return (
              <th
                key={column.key}
                scope="col"
                aria-sort={ariaSort}
                className={cn(
                  'px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.className,
                )}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSort(column)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded uppercase tracking-wide transition-colors',
                      'hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
                      isSorted && 'text-navy-900',
                    )}
                  >
                    {column.header}
                    {column.headerTooltip ? (
                      <Tooltip content={column.headerTooltip} className="ml-0.5">
                        <span tabIndex={-1} aria-label={`About ${column.header}`}>
                          <HelpCircle className="h-3 w-3 text-slate-400" aria-hidden />
                        </span>
                      </Tooltip>
                    ) : null}
                    {isSorted ? (
                      sortState!.direction === 'asc' ? (
                        <ArrowUp className="h-3 w-3 animate-sort-icon" aria-hidden />
                      ) : (
                        <ArrowDown className="h-3 w-3 animate-sort-icon" aria-hidden />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            );
          })}
          {rowQuickActions ? (
            <th scope="col" className="w-10 px-3 py-2.5">
              <span className="sr-only">Quick actions</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {pageRows.map((row, index) => {
          const rowId = getRowId(row);
          const isSelected = selectable && selectedIds.has(rowId);
          return (
            <tr
              key={rowId}
              onClick={interactive ? () => onRowActivate(row) : undefined}
              style={{ animationDelay: `${Math.min(index, 15) * 12}ms` }}
              className={cn(
                'group/row animate-row-in bg-white transition-colors',
                interactive && 'cursor-pointer hover:bg-slate-50',
                isSelected && 'bg-teal-50/60 hover:bg-teal-50',
              )}
            >
              {selectable ? (
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleRowSelection(rowId)}
                    aria-label={`Select ${rowId}`}
                    className={checkboxClasses}
                  />
                </td>
              ) : null}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-2.5 text-navy-900',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : String(column.accessor?.(row) ?? '')}
                </td>
              ))}
              {rowQuickActions ? (
                <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                  {/* Revealed on row hover / row focus-within; always present for a11y. */}
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 opacity-0 transition-opacity duration-150',
                      'focus-within:opacity-100 group-hover/row:opacity-100',
                      'motion-reduce:transition-none motion-reduce:group-hover/row:opacity-100',
                    )}
                  >
                    {rowQuickActions(row)}
                  </div>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
