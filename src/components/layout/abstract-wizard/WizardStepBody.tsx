'use client';

import { Check } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { properties } from '@/lib/data';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { WizardState } from './wizard-config';
import { LEASE_TYPES, STEPS, TERM_MONTHS } from './wizard-config';

const inputClasses =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

interface WizardStepBodyProps {
  step: number;
  form: WizardState;
  errorFor: (field: string) => string | undefined;
  onPatch: (patch: Partial<WizardState>) => void;
}

function FieldErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-700">
      {message}
    </p>
  );
}

function ReviewItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={
          mono
            ? 'mt-0.5 font-mono text-xs font-medium tabular-nums text-navy-900'
            : 'mt-0.5 text-xs font-medium text-navy-900'
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** Step indicator + the four wizard panels (parties, rent, dates, review). */
export function WizardStepBody({ step, form, errorFor, onPatch }: WizardStepBodyProps) {
  const annualRent = Number(form.baseRentAnnual.replace(/[^\d.]/g, '')) || 0;

  return (
    <div>
      <ol role="list" aria-label="Wizard steps" className="mb-5 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-1.5">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums',
                i < step
                  ? 'bg-teal-700 text-white'
                  : i === step
                    ? 'bg-navy-800 text-white'
                    : 'bg-slate-100 text-slate-400',
              )}
            >
              {i < step ? <Check aria-hidden className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-xs font-medium sm:inline',
                i === step ? 'text-navy-900' : 'text-slate-400',
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 ? (
              <span aria-hidden className="h-px flex-1 bg-slate-200" />
            ) : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="wz-property" className={labelClasses}>
              Property
            </label>
            <select
              id="wz-property"
              className={inputClasses}
              value={form.propertyId}
              onChange={(e) => onPatch({ propertyId: e.target.value })}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.city}, {p.state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wz-tenant" className={labelClasses}>
              Tenant legal name
            </label>
            <input
              id="wz-tenant"
              placeholder="e.g. Halloran &amp; Mercer LLP"
              className={cn(inputClasses, errorFor('tenantName') && 'border-red-400')}
              value={form.tenantName}
              onChange={(e) => onPatch({ tenantName: e.target.value })}
              aria-invalid={Boolean(errorFor('tenantName'))}
              aria-describedby={errorFor('tenantName') ? 'wz-tenant-error' : undefined}
            />
            <FieldErrorText id="wz-tenant-error" message={errorFor('tenantName')} />
          </div>
          <div>
            <label htmlFor="wz-ssm" className={labelClasses}>
              SSM / company registration no.
            </label>
            <input
              id="wz-ssm"
              placeholder="201901000001 (123456-A)"
              className={cn(
                inputClasses,
                'font-mono tabular-nums',
                errorFor('ssmNumber') && 'border-red-400',
              )}
              value={form.ssmNumber}
              onChange={(e) => onPatch({ ssmNumber: e.target.value })}
              aria-invalid={Boolean(errorFor('ssmNumber'))}
              aria-describedby={errorFor('ssmNumber') ? 'wz-ssm-error' : 'wz-ssm-hint'}
            />
            <FieldErrorText id="wz-ssm-error" message={errorFor('ssmNumber')} />
            {errorFor('ssmNumber') ? null : (
              <p id="wz-ssm-hint" className="mt-1 text-xs text-slate-400">
                Legacy 123456-A, 12-digit, or combined format.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="wz-type" className={labelClasses}>
              Property type
            </label>
            <select
              id="wz-type"
              className={inputClasses}
              value={form.leaseType}
              onChange={(e) => onPatch({ leaseType: e.target.value as WizardState['leaseType'] })}
            >
              {LEASE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="wz-term" className={labelClasses}>
              Term (months)
            </label>
            <select
              id="wz-term"
              className={`${inputClasses} font-mono tabular-nums`}
              value={form.termMonths}
              onChange={(e) => onPatch({ termMonths: Number(e.target.value) })}
            >
              {TERM_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wz-rent" className={labelClasses}>
              Annual base rent (USD)
            </label>
            <input
              id="wz-rent"
              inputMode="decimal"
              placeholder="420000"
              className={cn(
                inputClasses,
                'font-mono tabular-nums',
                errorFor('baseRentAnnual') && 'border-red-400',
              )}
              value={form.baseRentAnnual}
              onChange={(e) => onPatch({ baseRentAnnual: e.target.value })}
              aria-invalid={Boolean(errorFor('baseRentAnnual'))}
              aria-describedby={errorFor('baseRentAnnual') ? 'wz-rent-error' : undefined}
            />
            <FieldErrorText id="wz-rent-error" message={errorFor('baseRentAnnual')} />
            {errorFor('baseRentAnnual') ? null : annualRent > 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                ≈ {formatCurrency(Math.round(annualRent / 12))} per month
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="wz-commencement" className={labelClasses}>
              Commencement date
            </label>
            <DatePicker
              value={form.commencementDate}
              onChange={(iso) => onPatch({ commencementDate: iso })}
            />
            <FieldErrorText id="wz-commencement-error" message={errorFor('commencementDate')} />
          </div>
          <div>
            <label htmlFor="wz-option-years" className={labelClasses}>
              Renewal option term
            </label>
            <select
              id="wz-option-years"
              className={`${inputClasses} font-mono tabular-nums`}
              value={form.optionTermYears}
              onChange={(e) => onPatch({ optionTermYears: Number(e.target.value) })}
            >
              {[3, 5, 10].map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses}>Option notice deadline (optional)</label>
            <DatePicker
              value={form.optionNoticeDate}
              onChange={(iso) => onPatch({ optionNoticeDate: iso })}
            />
            <FieldErrorText id="wz-notice-error" message={errorFor('noticeDeadline')} />
            {errorFor('noticeDeadline') ? null : (
              <p className="mt-1 text-xs text-slate-400">
                Must fall before the expiration date; typically 6–12 months prior.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <ReviewItem label="Tenant" value={form.tenantName || '—'} />
          <ReviewItem label="SSM no." value={form.ssmNumber || '—'} mono />
          <ReviewItem label="Term" value={`${form.termMonths} months`} mono />
          <ReviewItem
            label="Annual base rent"
            value={annualRent > 0 ? formatCurrency(annualRent) : '—'}
            mono
          />
          <ReviewItem label="Commencement" value={form.commencementDate ?? '—'} mono />
          <ReviewItem
            label="Renewal option"
            value={`${form.optionTermYears} years${
              form.optionNoticeDate ? ` · notice ${form.optionNoticeDate}` : ''
            }`}
          />
        </dl>
      ) : null}
    </div>
  );
}
