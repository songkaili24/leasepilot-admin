import { properties } from '@/lib/data';
import {
  leaseDateErrors,
  positiveCurrencyError,
  required,
  ssmNumberError,
  type FieldError,
} from '@/lib/validation';

export const STEPS = [
  { id: 'parties', label: 'Parties' },
  { id: 'term', label: 'Term & rent' },
  { id: 'dates', label: 'Dates & options' },
  { id: 'review', label: 'Review' },
] as const;

export const LEASE_TYPES = [
  'Office',
  'Retail',
  'Industrial',
  'Flex',
  'Medical Office',
  'Data Center',
] as const;

export const TERM_MONTHS = [36, 60, 84, 120] as const;
export const OPTION_TERM_YEARS = [3, 5, 10] as const;

export interface WizardState {
  propertyId: string;
  tenantName: string;
  ssmNumber: string;
  leaseType: (typeof LEASE_TYPES)[number];
  commencementDate: string | null;
  termMonths: number;
  baseRentAnnual: string;
  optionTermYears: number;
  optionNoticeDate: string | null;
}

export const INITIAL_WIZARD: WizardState = {
  propertyId: properties[0]?.id ?? '',
  tenantName: '',
  ssmNumber: '',
  leaseType: 'Office',
  commencementDate: null,
  termMonths: 60,
  baseRentAnnual: '',
  optionTermYears: 5,
  optionNoticeDate: null,
};

/** Last day of the primary term implied by commencement + term length. */
export function previewExpiration(
  commencementDate: string | null,
  termMonths: number,
): string | null {
  if (!commencementDate) return null;
  const start = new Date(`${commencementDate}T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + termMonths);
  end.setDate(end.getDate() - 1);
  return end.toISOString().slice(0, 10);
}

/** Per-step validation gate. Returns field errors for the visible step. */
export function validateStep(step: number, form: WizardState): FieldError[] {
  if (step === 0) {
    return [
      required(form.tenantName, 'Tenant legal name') && {
        field: 'tenantName',
        message: required(form.tenantName, 'Tenant legal name')!,
      },
      ssmNumberError(form.ssmNumber) && {
        field: 'ssmNumber',
        message: ssmNumberError(form.ssmNumber)!,
      },
    ].filter((e): e is FieldError => e !== null);
  }
  if (step === 1) {
    return [
      positiveCurrencyError(form.baseRentAnnual, 'Annual base rent') && {
        field: 'baseRentAnnual',
        message: positiveCurrencyError(form.baseRentAnnual, 'Annual base rent')!,
      },
    ].filter((e): e is FieldError => e !== null);
  }
  if (step === 2) {
    // Term dates must be internally consistent: expiration after commencement,
    // option notice before expiration. Expiration derives from the term.
    return leaseDateErrors({
      commencementDate: form.commencementDate,
      expirationDate: previewExpiration(form.commencementDate, form.termMonths),
      noticeDeadline: form.optionNoticeDate,
    }).map((e) =>
      e.field === 'expirationDate'
        ? {
            ...e,
            field: 'commencementDate',
            message: 'Check the commencement date — term logic invalid',
          }
        : e,
    );
  }
  return [];
}
