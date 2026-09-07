'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { DataTableFilterSelect, DataTableSearch } from './DataTableToolbar';
import { DataTablePagination } from './DataTablePagination';
import { DataTableTable } from './DataTableTable';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Extracts the plain value used for default search text, filtering, and fallback sorting. */
  accessor?: (row: T) => string | number | null | undefined;
  /** Overrides the accessor for sorting (e.g. composite or normalized keys). */
  sortAccessor?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  /** Renders a dropdown filter for this column in the toolbar. */
  filterOptions?: Array<{ label: string; value: string }>;
  /** Value matched against the selected filter; defaults to the accessor output. */
  filterValue?: (row: T) => string;
  /** Field-definition tooltip shown beside the column header. */
  headerTooltip?: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  getRowId: (row: T) => string;
  /** When set, clicking a row navigates to this href (keyboard users use the row's link cells). */
  getRowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Overrides default search haystack (all accessor outputs joined). */
  getSearchText?: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Left toolbar slot for page-level filter controls (status chips, date ranges, …). */
  toolbar?: ReactNode;
  /** Enables bulk selection: leading checkbox column plus "select all" header. */
  selectable?: boolean;
  /** Receives the full set of selected ids across pages (not just the visible page). */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Renders the bulk-action bar shown when one or more rows are selected. */
  renderBulkActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  /** Noun for the "Showing x of y" line, e.g. "leases". */
  entityLabel?: string;
  /** Card renderer used below `md`; enables card-based mobile list views. */
  mobileCard?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  ariaLabel: string;
  className?: string;
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null;
type SortableValue = string | number | null | undefined;

const DEFAULT_PAGE_SIZES = [10, 25, 50];

function compareValues(a: SortableValue, b: SortableValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en-US', { numeric: true });
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  getRowHref,
  onRowClick,
  getSearchText,
  searchable = true,
  searchPlaceholder = 'Search…',
  toolbar,
  selectable = false,
  onSelectionChange,
  renderBulkActions,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  initialPageSize = 10,
  entityLabel = 'results',
  mobileCard,
  emptyState,
  ariaLabel,
  className,
}: DataTableProps<T>) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortState, setSortState] = useState<SortState>(null);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filterKey = JSON.stringify(columnFilters);
  const sortKey = sortState ? `${sortState.key}:${sortState.direction}` : '';

  useEffect(() => {
    setPage(1);
  }, [query, filterKey, sortKey, pageSize]);

  const processed = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = rows.filter((row) => {
      if (q) {
        const haystack = getSearchText
          ? getSearchText(row)
          : columns
              .map((c) => c.accessor?.(row))
              .filter((v) => v != null)
              .join(' ');
        if (!haystack.toLowerCase().includes(q)) return false;
      }
      for (const [key, selected] of Object.entries(columnFilters)) {
        if (!selected) continue;
        const column = columns.find((c) => c.key === key);
        if (!column) continue;
        const value = column.filterValue
          ? column.filterValue(row)
          : String(column.accessor?.(row) ?? '');
        if (value !== selected) return false;
      }
      return true;
    });

    if (sortState) {
      const column = columns.find((c) => c.key === sortState.key);
      if (column) {
        const accessor = column.sortAccessor ?? column.accessor;
        if (accessor) {
          const sorted = [...result].sort((a, b) => compareValues(accessor(a), accessor(b)));
          result = sortState.direction === 'desc' ? sorted.reverse() : sorted;
        }
      }
    }
    return result;
  }, [rows, columns, query, columnFilters, sortState, getSearchText]);

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = processed.slice(pageStart, pageStart + pageSize);
  const hasActiveFilters = query.trim() !== '' || Object.values(columnFilters).some(Boolean);
  const interactive = Boolean(onRowClick ?? getRowHref);

  function clearSelection() {
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  }

  function toggleRowSelection(rowId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      onSelectionChange?.([...next]);
      return next;
    });
  }

  const pageSelectedCount = pageRows.filter((row) => selectedIds.has(getRowId(row))).length;
  const allPageSelected = pageRows.length > 0 && pageSelectedCount === pageRows.length;

  function toggleSort(column: DataTableColumn<T>) {
    setSortState((prev) => {
      if (!prev || prev.key !== column.key) return { key: column.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: column.key, direction: 'desc' };
      return null;
    });
  }

  function handleRowActivate(row: T) {
    if (onRowClick) {
      onRowClick(row);
    } else if (getRowHref) {
      router.push(getRowHref(row));
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      {(searchable || columns.some((c) => c.filterOptions) || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {columns
              .filter((c) => c.filterOptions)
              .map((column) => (
                <DataTableFilterSelect
                  key={column.key}
                  header={column.header}
                  value={columnFilters[column.key] ?? ''}
                  options={column.filterOptions!}
                  onChange={(next) => setColumnFilters((prev) => ({ ...prev, [column.key]: next }))}
                />
              ))}
          </div>
          {searchable ? (
            <DataTableSearch
              value={query}
              onChange={setQuery}
              entityLabel={entityLabel}
              placeholder={searchPlaceholder}
            />
          ) : null}
        </div>
      )}

      {selectable && selectedIds.size > 0 ? (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-teal-50 px-4 py-2.5"
        >
          <span aria-live="polite" className="text-sm font-medium text-teal-900">
            {selectedIds.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {renderBulkActions?.([...selectedIds], clearSelection)}
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-navy-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {pageRows.length === 0 ? (
        <div className="border-t border-slate-200">
          {emptyState ?? (
            <EmptyState
              title={hasActiveFilters ? 'No results match your filters' : 'Nothing here yet'}
              description={
                hasActiveFilters
                  ? 'Adjust or clear the search and filter criteria to see more results.'
                  : undefined
              }
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setColumnFilters({});
                    }}
                    className="text-sm font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    Clear all filters
                  </button>
                ) : undefined
              }
            />
          )}
        </div>
      ) : mobileCard ? (
        <div className="grid gap-3 border-t border-slate-200 p-3 md:hidden">
          {pageRows.map((row) => (
            <div
              key={getRowId(row)}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRowActivate(row);
                      }
                    }
                  : undefined
              }
              onClick={interactive ? () => handleRowActivate(row) : undefined}
            >
              {mobileCard(row)}
            </div>
          ))}
        </div>
      ) : null}

      {pageRows.length > 0 ? (
        <div
          className={cn(
            'overflow-x-auto border-t border-slate-200',
            mobileCard && 'hidden md:block',
          )}
        >
          <DataTableTable
            columns={columns}
            pageRows={pageRows}
            getRowId={getRowId}
            sortState={sortState}
            onToggleSort={toggleSort}
            interactive={interactive}
            onRowActivate={handleRowActivate}
            ariaLabel={ariaLabel}
            selectable={selectable}
            selectedIds={selectedIds}
            allPageSelected={allPageSelected}
            onTogglePageSelection={(checked) => {
              const next = new Set(selectedIds);
              for (const row of pageRows) {
                if (checked) {
                  next.add(getRowId(row));
                } else {
                  next.delete(getRowId(row));
                }
              }
              setSelectedIds(next);
              onSelectionChange?.([...next]);
            }}
            onToggleRowSelection={toggleRowSelection}
          />
        </div>
      ) : null}

      <DataTablePagination
        filteredCount={processed.length}
        pageStart={pageStart}
        pageCount={pageRows.length}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        entityLabel={entityLabel}
        onPageSizeChange={setPageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
