import { describe, expect, it } from 'vitest';
import {
  formatArea,
  formatCurrency,
  formatCurrencyExact,
  formatNumber,
  formatPct,
  formatRate,
  normalizeLeaseNumber,
} from '@/lib/format';

describe('currency formatting', () => {
  it('formats whole-dollar USD with separators', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats exact cents', () => {
    expect(formatCurrencyExact(1234.5)).toBe('$1,234.50');
  });
});

describe('number and area formatting', () => {
  it('uses en-US separators', () => {
    expect(formatNumber(24500)).toBe('24,500');
  });

  it('suffixes square footage', () => {
    expect(formatArea(2450)).toBe('2,450 SF');
  });
});

describe('rate and percentage formatting', () => {
  it('formats per-SF rates to two decimals', () => {
    expect(formatRate(38.456)).toBe('$38.46');
    expect(formatRate(0)).toBe('$0.00');
  });

  it('formats percentages to one decimal', () => {
    expect(formatPct(3)).toBe('3.0%');
    expect(formatPct(2.6)).toBe('2.6%'); // avoid binary-float edge values like 2.55
  });
});

describe('normalizeLeaseNumber', () => {
  it('upper-cases and hyphenates lease numbers', () => {
    expect(normalizeLeaseNumber('lv 2024 0482')).toBe('LV-2024-0482');
    expect(normalizeLeaseNumber('lv-2024-0482')).toBe('LV-2024-0482');
  });

  it('prefixes the LV- scheme when omitted', () => {
    expect(normalizeLeaseNumber('2024-0482')).toBe('LV-2024-0482');
  });

  it('leaves canonical input untouched', () => {
    expect(normalizeLeaseNumber('LV-2024-0482')).toBe('LV-2024-0482');
  });
});
