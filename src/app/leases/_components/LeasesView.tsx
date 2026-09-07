'use client';

import { useMemo, useState } from 'react';
import { Download, Eye, FileDown } from 'lucide-react';
import Link from 'next/link';
import { Button, DataTable } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { leases, properties } from '@/lib/data';
import { downloadCsv, toCsv } from '@/lib/csv';
import { toISODate } from '@/lib/dates';
import type { Lease } from '@/lib/types';
import { LeaseFilterSidebar, type LeaseFilterState } from './LeaseFilterSidebar';
import { LeaseCard } from './LeaseCard';
import { ALL_STATUSES, buildLeaseColumns } from './lease-columns';
import { CSV_HEADERS, leaseToCsvRow } from './lease-export';

export function LeasesView() {
  const today = toISODate(new Date());
  const [filters, setFilters] = useState<LeaseFilterState>({
    statuses: new Set(ALL_STATUSES),
    propertyId: 'all',
    rentMin: '',
    rentMax: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredLeases = useMemo(() => {
    const min = Number(filters.rentMin);
    const max = Number(filters.rentMax);
    return leases.filter((lease) => {
      if (!filters.statuses.has(lease.status)) return false;
      if (filters.propertyId !== 'all' && lease.propertyId !== filters.propertyId) return false;
      if (filters.rentMin !== '' && lease.baseRentMonthly < min) return false;
      if (filters.rentMax !== '' && lease.baseRentMonthly > max) return false;
      return true;
    });
  }, [filters]);

  const selectedLeases = useMemo(
    () => leases.filter((lease) => selectedIds.includes(lease.id)),
    [selectedIds],
  );

  function exportCsv(rows: Lease[], label: string) {
    const csv = toCsv(CSV_HEADERS, rows.map(leaseToCsvRow));
    downloadCsv(`leasevault-${label}-${today}.csv`, csv);
  }

  const propertyOptions = properties.map((p) => ({ id: p.id, label: p.name }));

  return (
    <>
      <PageHeader
        title="All Leases"
        description="Every lease abstract in the working portfolio. Select rows to export; open a row for the full abstract."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <LeaseFilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            propertyOptions={propertyOptions}
            resultCount={filteredLeases.length}
            totalCount={leases.length}
          />
        </div>

        <DataTable
          ariaLabel="Lease abstracts"
          entityLabel="leases"
          rows={filteredLeases}
          getRowId={(lease) => lease.id}
          getRowHref={(lease) => `/leases/${lease.id}`}
          searchPlaceholder="Search tenant, lease ID, property…"
          initialPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          selectable
          onSelectionChange={setSelectedIds}
          renderBulkActions={(ids, clearSelection) => (
            <Button
              size="xs"
              trailingIcon={<Download aria-hidden className="h-3.5 w-3.5 text-teal-200" />}
              onClick={() => {
                exportCsv(selectedLeases, 'selected-leases');
                clearSelection();
              }}
            >
              Export {ids.length} to CSV
            </Button>
          )}
          toolbar={
            <button
              type="button"
              onClick={() => exportCsv(filteredLeases, 'all-leases')}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-navy-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <Download aria-hidden className="h-4 w-4 text-slate-400" />
              Export view
            </button>
          }
          columns={buildLeaseColumns(today, propertyOptions)}
          rowQuickActions={(lease) => (
            <>
              <Link
                href={`/leases/${lease.id}`}
                title="Open abstract"
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-navy-800 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <Eye aria-hidden className="h-3 w-3" />
                <span className="hidden xl:inline">Open</span>
              </Link>
              <button
                type="button"
                title="Export row to CSV"
                onClick={() => exportCsv([lease], lease.leaseNumber)}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-navy-800 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <FileDown aria-hidden className="h-3 w-3" />
                <span className="hidden xl:inline">CSV</span>
              </button>
            </>
          )}
          mobileCard={(lease: Lease) => <LeaseCard lease={lease} />}
        />
      </div>
    </>
  );
}
