'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from './Tooltip';
import type { DataTableColumn } from './DataTable';

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

interface DataTableTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  pageRows: T[];
  getRowId: (row: T) => string;
  sortState: SortState;
  onToggleSort: (column: DataTableColumn<T>) => void;
  interactive: boolean;
  onRowActivate: (row: T) => void;
  ariaLabel: string;
}

/** Sortable header + body rows. Presentational; state lives in DataTable. */
export function DataTableTable<T>({
  columns,
  pageRows,
  getRowId,
  sortState,
  onToggleSort,
  interactive,
  onRowActivate,
  ariaLabel,
}: DataTableTableProps<T>) {
  return (
    <table className="w-full min-w-[56rem] border-collapse text-sm" aria-label={ariaLabel}>
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
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
                        <ArrowUp className="h-3 w-3" aria-hidden />
                      ) : (
                        <ArrowDown className="h-3 w-3" aria-hidden />
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
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {pageRows.map((row) => (
          <tr
            key={getRowId(row)}
            onClick={interactive ? () => onRowActivate(row) : undefined}
            className={cn(
              'bg-white transition-colors',
              interactive && 'cursor-pointer hover:bg-slate-50',
            )}
          >
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
