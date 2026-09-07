import { describe, expect, it } from 'vitest';
import {
  validateStep,
  previewExpiration,
  INITIAL_WIZARD,
} from '@/components/layout/abstract-wizard/wizard-config';
import type { WizardState } from '@/components/layout/abstract-wizard/wizard-config';

const validForm: WizardState = {
  propertyId: 'prop-1',
  tenantName: 'Halloran & Mercer LLP',
  ssmNumber: '201901000001',
  leaseType: 'Office',
  commencementDate: '2026-10-01',
  termMonths: 60,
  baseRentAnnual: '420000',
  optionTermYears: 5,
  optionNoticeDate: '2031-08-01',
};

describe('validateStep — step 0 (parties)', () => {
  it('requires tenant name and SSM number', () => {
    const errors = validateStep(0, { ...INITIAL_WIZARD, tenantName: '', ssmNumber: '' });
    expect(errors.map((e) => e.field).sort()).toEqual(['ssmNumber', 'tenantName']);
  });

  it('passes a complete parties step', () => {
    expect(validateStep(0, validForm)).toEqual([]);
  });

  it('rejects malformed SSM numbers', () => {
    const errors = validateStep(0, { ...validForm, ssmNumber: 'nope' });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('ssmNumber');
  });
});

describe('validateStep — step 1 (term & rent)', () => {
  it('requires a positive annual base rent', () => {
    const errors = validateStep(1, { ...validForm, baseRentAnnual: '' });
    expect(errors.map((e) => e.field)).toEqual(['baseRentAnnual']);
  });

  it('accepts comma-formatted rent', () => {
    expect(validateStep(1, { ...validForm, baseRentAnnual: '420,000' })).toEqual([]);
  });
});

describe('validateStep — step 2 (dates & options)', () => {
  it('requires a commencement date', () => {
    const errors = validateStep(2, { ...validForm, commencementDate: null });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].field).toBe('commencementDate');
  });

  it('rejects option notice deadlines after the derived expiration', () => {
    // 2026-10-01 + 60 months expires 2031-09-30; a 2031-10-01 notice is too late.
    const errors = validateStep(2, { ...validForm, optionNoticeDate: '2031-10-01' });
    expect(errors.some((e) => e.field === 'noticeDeadline')).toBe(true);
  });

  it('accepts a notice deadline before expiration', () => {
    expect(validateStep(2, validForm)).toEqual([]);
  });
});

describe('validateStep — step 3 (review)', () => {
  it('is a review step with no validation', () => {
    expect(validateStep(3, INITIAL_WIZARD)).toEqual([]);
  });
});

// [-BUG-] previewExpiration converts through toISOString (UTC), so on any
// UTC+ timezone the returned expiration is one day early. Concretely, on a
// UTC+8 machine: local 2026-03-01 00:00 → minus one day = local 2027-02-28
// 00:00 → UTC 2027-02-27T16:00Z → sliced as 2027-02-27 instead of 2027-02-28.
// The value feeds the "Term expires …" preview in wizard step 2, so users in
// UTC+ timezones see the wrong last day of term.
describe('previewExpiration', () => {
  it('[-BUG tz-off-by-one] returns the last day of the term in local terms', () => {
    expect(previewExpiration('2026-03-01', 12)).toBe('2027-02-28');
  });
});
