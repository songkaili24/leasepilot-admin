/**
 * Form validation primitives. Pure functions returning `null` when valid or
 * a human-readable message when invalid, so call sites compose them freely.
 */

export interface FieldError {
  field: string;
  message: string;
}

export function required(value: string, field: string): string | null {
  return value.trim() === '' ? `${field} is required` : null;
}

/**
 * SSM (Suruhanjaya Syarikat Malaysia) company/registration number.
 * Accepts the legacy 8-digit format (e.g. 123456-A), the newer 12-digit
 * format (e.g. 201901000001 (123456-A)), or a bare 12-digit number.
 */
export function isValidSsmNumber(value: string): boolean {
  const trimmed = value.trim().toUpperCase();
  const legacy = /^\d{6}-?\d{2}-?([0-9A-Z])$/;
  const twelveDigit = /^\d{12}$/;
  const combined = /^\d{12}\s*\(\s*\d{6}-?\d{2}-?[0-9A-Z]\s*\)$/;
  return legacy.test(trimmed) || twelveDigit.test(trimmed) || combined.test(trimmed);
}

export function ssmNumberError(value: string): string | null {
  if (value.trim() === '') return 'SSM / company registration number is required';
  return isValidSsmNumber(value)
    ? null
    : 'Use a valid SSM format: 123456-A, 123456789012, or 201901000001 (123456-A)';
}

export function emailError(value: string): string | null {
  if (value.trim() === '') return 'Email is required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Enter a valid business email';
}

export function positiveCurrencyError(value: string, field: string): string | null {
  if (value.trim() === '') return `${field} is required`;
  const n = Number(value.replace(/[^\d.]/g, ''));
  if (Number.isNaN(n) || n <= 0) return `${field} must be a positive amount`;
  return null;
}

export function numberInRangeError(
  value: string,
  field: string,
  min: number,
  max: number,
): string | null {
  if (value.trim() === '') return `${field} is required`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${field} must be a number`;
  if (n < min || n > max) return `${field} must be between ${min} and ${max}`;
  return null;
}

export interface DateLogicInput {
  commencementDate: string | null;
  expirationDate: string | null;
  noticeDeadline?: string | null;
}

/** Cross-field lease date validation: notice < expiration and expiration > commencement. */
export function leaseDateErrors(input: DateLogicInput): FieldError[] {
  const errors: FieldError[] = [];
  if (!input.commencementDate) {
    errors.push({ field: 'commencementDate', message: 'Commencement date is required' });
  }
  if (!input.expirationDate) {
    errors.push({ field: 'expirationDate', message: 'Expiration date is required' });
  }
  if (input.commencementDate && input.expirationDate) {
    if (input.expirationDate <= input.commencementDate) {
      errors.push({
        field: 'expirationDate',
        message: 'Expiration must fall after the commencement date',
      });
    }
    const termDays =
      (Date.parse(input.expirationDate) - Date.parse(input.commencementDate)) / 86_400_000;
    if (termDays < 365) {
      errors.push({
        field: 'expirationDate',
        message: 'Commercial terms under one year are unusual — confirm the abstraction',
      });
    }
  }
  if (
    input.noticeDeadline &&
    input.expirationDate &&
    input.noticeDeadline >= input.expirationDate
  ) {
    errors.push({
      field: 'noticeDeadline',
      message: 'Option notice deadline must precede the expiration date',
    });
  }
  return errors;
}

/** Future-dated obligations cannot be recorded with a past due date. */
export function futureObligationDateError(
  dueDate: string | null,
  isFutureObligation: boolean,
): string | null {
  if (!dueDate) return 'Due date is required';
  if (!isFutureObligation) return null;
  const today = new Date().toISOString().slice(0, 10);
  return dueDate < today ? 'Future obligations cannot carry a past due date' : null;
}

/* ------------------------------------------------------------------ */
/* Document upload constraints                                         */
/* ------------------------------------------------------------------ */

export const MAX_UPLOAD_MB = 10;

export function uploadFileError(
  file: { name: string; size: number },
  requirePdf: boolean,
): string | null {
  if (requirePdf && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF documents are accepted for the vault';
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return `File exceeds the ${MAX_UPLOAD_MB} MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
  }
  return null;
}

/** Next version label for a document stack: "1.0" -> "2.0", "2.0" -> "3.0". */
export function nextVersionLabel(currentVersions: string[]): string {
  const majors = currentVersions
    .map((v) => Number.parseInt(v.split('.')[0] ?? '0', 10))
    .filter((n) => !Number.isNaN(n));
  return `${Math.max(0, ...majors) + 1}.0`;
}
