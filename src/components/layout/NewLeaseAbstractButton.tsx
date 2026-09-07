'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { properties } from '@/lib/data';
import { formatCurrency } from '@/lib/format';

const LEASE_TYPES = [
  'Office',
  'Retail',
  'Industrial',
  'Flex',
  'Medical Office',
  'Data Center',
] as const;
const TERM_MONTHS = [36, 60, 84, 120] as const;

/**
 * "New Lease Abstract" primary action — opens an intake form. In production
 * this posts to the abstracting pipeline; here it validates and confirms.
 */
export function NewLeaseAbstractButton({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    propertyId: properties[0]?.id ?? '',
    tenantName: '',
    leaseType: 'Office',
    commencementDate: null as string | null,
    termMonths: 60,
    baseRentAnnual: '',
  });

  function close() {
    setOpen(false);
    // Let the dialog fade before resetting, so the state swap isn't visible.
    window.setTimeout(() => {
      setSubmitted(false);
      setForm({
        propertyId: properties[0]?.id ?? '',
        tenantName: '',
        leaseType: 'Office',
        commencementDate: null,
        termMonths: 60,
        baseRentAnnual: '',
      });
    }, 150);
  }

  const inputClasses =
    'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';

  const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

  const annualRent = Number(form.baseRentAnnual.replace(/[^\d.]/g, '')) || 0;
  const canSubmit =
    form.propertyId !== '' &&
    form.tenantName.trim() !== '' &&
    form.commencementDate !== null &&
    annualRent > 0;

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Plus aria-hidden className="h-4 w-4" />
        <span className="hidden sm:inline">New Lease Abstract</span>
        <span className="sm:hidden">Abstract</span>
      </Button>
      <Modal
        open={open}
        onClose={close}
        title="New Lease Abstract"
        description="Enter the headline economics; the abstracting team completes the full record."
        footer={
          submitted ? (
            <Button onClick={close}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button disabled={!canSubmit} onClick={() => setSubmitted(true)}>
                Create abstract
              </Button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-teal-800">
              Abstract intake created for {form.tenantName.trim()}.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Lease number and full abstract record will be generated during review.
            </p>
          </div>
        ) : (
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) setSubmitted(true);
            }}
          >
            <div className="sm:col-span-2">
              <label htmlFor="nl-property" className={labelClasses}>
                Property
              </label>
              <select
                id="nl-property"
                className={inputClasses}
                value={form.propertyId}
                onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.city}, {p.state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nl-tenant" className={labelClasses}>
                Tenant legal name
              </label>
              <input
                id="nl-tenant"
                required
                placeholder="e.g. Halloran &amp; Mercer LLP"
                className={inputClasses}
                value={form.tenantName}
                onChange={(e) => setForm((f) => ({ ...f, tenantName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="nl-type" className={labelClasses}>
                Property type
              </label>
              <select
                id="nl-type"
                className={inputClasses}
                value={form.leaseType}
                onChange={(e) => setForm((f) => ({ ...f, leaseType: e.target.value }))}
              >
                {LEASE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nl-commencement" className={labelClasses}>
                Commencement date
              </label>
              <DatePicker
                value={form.commencementDate}
                onChange={(iso) => setForm((f) => ({ ...f, commencementDate: iso }))}
              />
            </div>
            <div>
              <label htmlFor="nl-term" className={labelClasses}>
                Term (months)
              </label>
              <select
                id="nl-term"
                className={`${inputClasses} font-mono tabular-nums`}
                value={form.termMonths}
                onChange={(e) => setForm((f) => ({ ...f, termMonths: Number(e.target.value) }))}
              >
                {TERM_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="nl-rent" className={labelClasses}>
                Annual base rent (USD)
              </label>
              <input
                id="nl-rent"
                required
                inputMode="decimal"
                placeholder="420000"
                className={`${inputClasses} font-mono tabular-nums`}
                value={form.baseRentAnnual}
                onChange={(e) => setForm((f) => ({ ...f, baseRentAnnual: e.target.value }))}
              />
              {annualRent > 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  ≈ {formatCurrency(Math.round(annualRent / 12))} per month
                </p>
              ) : null}
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
