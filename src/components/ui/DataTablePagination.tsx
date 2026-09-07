'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTablePagination({
  filteredCount,
  pageStart,
  pageCount,
  pageSize,
  pageSizeOptions,
  currentPage,
  totalPages,
  entityLabel,
  onPageSizeChange,
  onPageChange,
}: {
  filteredCount: number;
  pageStart: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  currentPage: number;
  totalPages: number;
  entityLabel: string;
  onPageSizeChange: (next: number) => void;
  onPageChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
      <p className="text-xs text-slate-500">
        Showing{' '}
        <span className="font-mono tabular-nums">
          {filteredCount === 0 ? 0 : pageStart + 1}–{pageStart + pageCount}
        </span>{' '}
        of <span className="font-mono tabular-nums">{filteredCount}</span> {entityLabel}
      </p>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Rows
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 rounded border border-slate-300 bg-white px-1.5 font-mono text-xs tabular-nums text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-[4.5rem] text-center font-mono text-xs tabular-nums text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
