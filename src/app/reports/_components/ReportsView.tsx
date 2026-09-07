'use client';

import { useState } from 'react';
import { CalendarClock, Banknote, FileSpreadsheet, FileText, PieChart, Scale } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { properties, leases } from '@/lib/data';
import { formatArea, formatCurrency, formatPct } from '@/lib/format';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  cadence: string;
  format: 'XLSX' | 'PDF';
  icon: typeof FileText;
  rows: string;
}

const REPORTS: ReportTemplate[] = [
  {
    id: 'rent-roll',
    name: 'Portfolio Rent Roll',
    description:
      'Per-property rent roll: tenant, suite, rentable area, base rent, effective rate, and term dates.',
    cadence: 'Effective as of selected date',
    format: 'XLSX',
    icon: FileSpreadsheet,
    rows: `${leases.length} leases · ${properties.length} properties`,
  },
  {
    id: 'critical-dates',
    name: 'Critical Dates Report',
    description:
      'All contractual deadlines grouped by urgency window with responsible party and notice requirements.',
    cadence: 'Rolling 24-month window',
    format: 'PDF',
    icon: CalendarClock,
    rows: 'Grouped by red / amber / ok',
  },
  {
    id: 'obligation-schedule',
    name: 'Financial Obligation Schedule',
    description:
      'Annualized base rent, CAM, taxes, and pass-throughs by lease and category, with escalation dates.',
    cadence: 'Fiscal-year schedule',
    format: 'XLSX',
    icon: Banknote,
    rows: 'By category and lease',
  },
  {
    id: 'expiration-ladder',
    name: 'Lease Expiration Ladder',
    description:
      'Ten-year expiration ladder with renewal option windows, estimated downtime, and release assumptions.',
    cadence: 'Ten-year horizon',
    format: 'XLSX',
    icon: FileText,
    rows: 'By expiration year',
  },
  {
    id: 'portfolio-summary',
    name: 'Portfolio Occupancy Summary',
    description:
      'Occupancy, weighted average lease term, and leased/available split by property and asset type.',
    cadence: 'Point-in-time snapshot',
    format: 'PDF',
    icon: PieChart,
    rows: `${properties.length} properties`,
  },
  {
    id: 'reconciliation-status',
    name: 'CAM Reconciliation Status',
    description:
      'Estimated vs. reconciled operating expense pass-throughs with outstanding true-up balances.',
    cadence: 'Post year-end cycle',
    format: 'XLSX',
    icon: Scale,
    rows: 'By lease and expense pool',
  },
];

export function ReportsView() {
  const [generating, setGenerating] = useState<ReportTemplate | null>(null);
  const [queued, setQueued] = useState(false);

  const totalABR = leases
    .filter((l) => l.status !== 'Terminated')
    .reduce((sum, l) => sum + l.baseRentMonthly * 12, 0);

  return (
    <>
      <PageHeader
        title="Reports & Exports"
        description="Standard reporting package. Exports reflect the working dataset; scheduling is configured in Settings."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <section
              key={report.id}
              aria-labelledby={`report-${report.id}`}
              className="flex flex-col rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800">
                  <Icon aria-hidden className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 id={`report-${report.id}`} className="text-sm font-semibold text-navy-900">
                    {report.name}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-slate-500">{report.description}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {report.format}
                </span>
                <span>{report.cadence}</span>
                <span>{report.rows}</span>
              </div>
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGenerating(report);
                    setQueued(false);
                  }}
                >
                  Configure &amp; export
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Current dataset totals: {formatCurrency(totalABR)} annualized base rent ·{' '}
        {formatArea(leases.reduce((sum, l) => sum + l.rentableSf, 0))} under abstraction ·{' '}
        {formatPct((leases.filter((l) => l.status === 'Active').length / leases.length) * 100)} of
        abstracts in Active status.
      </p>

      <Modal
        open={generating !== null}
        onClose={() => setGenerating(null)}
        title={queued ? 'Export queued' : `Export — ${generating?.name ?? ''}`}
        description={
          queued
            ? 'The export is being generated. It will appear in Reports & Exports history when complete.'
            : generating?.description
        }
        footer={
          queued ? (
            <Button onClick={() => setGenerating(null)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setGenerating(null)}>
                Cancel
              </Button>
              <Button onClick={() => setQueued(true)}>Queue export</Button>
            </>
          )
        }
      >
        {!queued && generating ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Format:{' '}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700">
                {generating.format}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              {generating.rows}. The export uses the current working dataset.
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
