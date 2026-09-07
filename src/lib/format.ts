/**
 * Deterministic formatting helpers for financial figures and lease numbers.
 * All currency renders in USD with explicit thousands separators; lease
 * numbers and figures render in IBM Plex Mono via the `font-mono` utility.
 */

const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usd2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatCurrency(value: number): string {
  return usd0.format(value);
}

export function formatCurrencyExact(value: number): string {
  return usd2.format(value);
}

export function formatNumber(value: number): string {
  return decimal0.format(value);
}

/** Square footage with locale separators, e.g. "24,500 SF". */
export function formatArea(sf: number): string {
  return `${decimal0.format(sf)} SF`;
}

/** Rent in dollars-per-square-foot terms, e.g. "$38.45". */
export function formatRate(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Normalizes lease numbers like "lv 2024-0482" to "LV-2024-0482". */
export function normalizeLeaseNumber(input: string): string {
  const upper = input.trim().toUpperCase().replace(/\s+/g, '-');
  return upper.startsWith('LV-') ? upper : `LV-${upper}`;
}
