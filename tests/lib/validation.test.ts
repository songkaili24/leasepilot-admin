import { describe, expect, it } from 'vitest';
import {
  emailError,
  futureObligationDateError,
  leaseDateErrors,
  nextVersionLabel,
  numberInRangeError,
  positiveCurrencyError,
  required,
  ssmNumberError,
  uploadFileError,
  MAX_UPLOAD_MB,
} from '@/lib/validation';

describe('ssmNumberError (SSM / company registration format)', () => {
  it('accepts the bare 12-digit new-format number', () => {
    expect(ssmNumberError('201901000001')).toBeNull();
  });

  it('accepts the 12-digit number combined with the legacy number in parentheses when 8 digits are supplied', () => {
    expect(ssmNumberError('201901000001 (12345678-A)')).toBeNull();
  });

  it('accepts an 8-digit legacy registration with check letter', () => {
    expect(ssmNumberError('12345678-A')).toBeNull();
    expect(ssmNumberError('12345678A')).toBeNull();
  });

  it('rejects empty and whitespace-only input', () => {
    expect(ssmNumberError('')).not.toBeNull();
    expect(ssmNumberError('   ')).not.toBeNull();
  });

  it('rejects malformed numbers', () => {
    expect(ssmNumberError('abc')).not.toBeNull();
    expect(ssmNumberError('12345')).not.toBeNull();
    expect(ssmNumberError('1234567890123')).not.toBeNull(); // 13 digits
    expect(ssmNumberError('1234-56-A')).not.toBeNull();
  });

  // [-BUG-] The wizard UI advertises "Legacy 123456-A" and the placeholder
  // "201901000001 (123456-A)" (see AbstractWizardButton hint text), but the
  // validator's legacy branch requires 8 digits before the check letter, so
  // both advertised formats are rejected and step 1 of the wizard cannot be
  // completed with them. Failing test demonstrates the inconsistency.
  it('[-BUG ssm-format] accepts the legacy format advertised in the UI (123456-A)', () => {
    expect(ssmNumberError('123456-A')).toBeNull();
  });

  it('[-BUG ssm-format] accepts the combined placeholder example shown in the wizard (201901000001 (123456-A))', () => {
    expect(ssmNumberError('201901000001 (123456-A)')).toBeNull();
  });
});

describe('emailError', () => {
  it('accepts ordinary business emails', () => {
    expect(emailError('jane@acme.com')).toBeNull();
    expect(emailError('first.last+pm@sub.example.co')).toBeNull();
  });

  it('rejects missing/invalid shapes', () => {
    expect(emailError('')).not.toBeNull();
    expect(emailError('jane@acme')).not.toBeNull();
    expect(emailError('jane acme.com')).not.toBeNull();
    expect(emailError('@acme.com')).not.toBeNull();
  });
});

describe('required / numeric validators', () => {
  it('treats whitespace-only as missing', () => {
    expect(required('  ', 'Tenant')).toBe('Tenant is required');
    expect(required('Halloran & Mercer LLP', 'Tenant')).toBeNull();
  });

  it('requires positive currency amounts and ignores formatting characters', () => {
    expect(positiveCurrencyError('', 'Annual base rent')).not.toBeNull();
    expect(positiveCurrencyError('abc', 'Annual base rent')).not.toBeNull();
    expect(positiveCurrencyError('0', 'Annual base rent')).not.toBeNull();
    expect(positiveCurrencyError('-420000', 'Annual base rent')).not.toBeNull();
    expect(positiveCurrencyError('420,000', 'Annual base rent')).toBeNull();
    expect(positiveCurrencyError('420000.00', 'Annual base rent')).toBeNull();
  });

  it('enforces numeric ranges inclusively', () => {
    expect(numberInRangeError('0', 'Escalation', 0, 10)).toBeNull();
    expect(numberInRangeError('10', 'Escalation', 0, 10)).toBeNull();
    expect(numberInRangeError('-1', 'Escalation', 0, 10)).not.toBeNull();
    expect(numberInRangeError('10.5', 'Escalation', 0, 10)).not.toBeNull();
    expect(numberInRangeError('x', 'Escalation', 0, 10)).not.toBeNull();
  });
});

describe('leaseDateErrors', () => {
  it('requires both dates', () => {
    const errors = leaseDateErrors({ commencementDate: null, expirationDate: null });
    expect(errors.map((e) => e.field).sort()).toEqual(['commencementDate', 'expirationDate']);
  });

  it('rejects expiration on or before commencement', () => {
    const same = leaseDateErrors({
      commencementDate: '2026-01-01',
      expirationDate: '2026-01-01',
    });
    expect(same.some((e) => e.field === 'expirationDate')).toBe(true);

    const before = leaseDateErrors({
      commencementDate: '2026-06-01',
      expirationDate: '2026-01-01',
    });
    expect(before.some((e) => e.field === 'expirationDate')).toBe(true);
  });

  it('accepts a multi-year term with the notice deadline before expiration', () => {
    const errors = leaseDateErrors({
      commencementDate: '2026-01-01',
      expirationDate: '2031-12-31',
      noticeDeadline: '2031-08-01',
    });
    expect(errors).toEqual([]);
  });

  it('rejects notice deadlines on or after expiration', () => {
    for (const notice of ['2031-12-31', '2032-01-01']) {
      const errors = leaseDateErrors({
        commencementDate: '2026-01-01',
        expirationDate: '2031-12-31',
        noticeDeadline: notice,
      });
      expect(errors.some((e) => e.field === 'noticeDeadline')).toBe(true);
    }
  });

  it('flags terms under one year as unusual', () => {
    const errors = leaseDateErrors({
      commencementDate: '2026-01-01',
      expirationDate: '2026-06-30',
    });
    expect(errors.some((e) => e.message.includes('under one year'))).toBe(true);
  });
});

describe('futureObligationDateError', () => {
  it('requires a due date', () => {
    expect(futureObligationDateError(null, true)).not.toBeNull();
    expect(futureObligationDateError(null, false)).not.toBeNull();
  });

  it('allows any due date for non-future obligations (backdating corrections)', () => {
    expect(futureObligationDateError('2020-01-01', false)).toBeNull();
  });

  it('rejects past dates for future obligations', () => {
    expect(futureObligationDateError('2020-01-01', true)).not.toBeNull();
  });

  it('accepts today and future dates for future obligations', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate(),
    ).padStart(2, '0')}`;
    expect(futureObligationDateError(iso, true)).toBeNull();
    expect(futureObligationDateError('2099-12-31', true)).toBeNull();
  });
});

describe('uploadFileError', () => {
  it('rejects non-PDF files when the policy requires PDF', () => {
    expect(uploadFileError({ name: 'notes.txt', size: 100 }, true)).toMatch(/PDF/i);
    expect(uploadFileError({ name: 'scan.docx', size: 100 }, true)).toMatch(/PDF/i);
  });

  it('accepts upper-case .PDF extensions', () => {
    expect(uploadFileError({ name: 'LEASE.PDF', size: 100 }, true)).toBeNull();
  });

  it('enforces the 10 MB ceiling inclusively', () => {
    const limit = MAX_UPLOAD_MB * 1024 * 1024;
    expect(uploadFileError({ name: 'lease.pdf', size: limit }, true)).toBeNull();
    expect(uploadFileError({ name: 'lease.pdf', size: limit + 1 }, true)).toMatch(/10 MB/);
  });

  it('ignores the PDF rule when the policy is disabled', () => {
    expect(uploadFileError({ name: 'notes.txt', size: 100 }, false)).toBeNull();
  });
});

describe('nextVersionLabel', () => {
  it('increments the major version of an existing stack', () => {
    expect(nextVersionLabel(['1.0'])).toBe('2.0');
    expect(nextVersionLabel(['1.0', '2.0', '3.0'])).toBe('4.0');
  });

  it('starts at 1.0 for an empty stack', () => {
    expect(nextVersionLabel([])).toBe('1.0');
  });

  it('uses the highest major version regardless of minor', () => {
    expect(nextVersionLabel(['1.0', '2.5'])).toBe('3.0');
  });
});
