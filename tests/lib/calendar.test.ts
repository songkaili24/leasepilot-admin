import { describe, expect, it } from 'vitest';
import {
  categoryBadgeTone,
  categoryDotClass,
  categoryForDateType,
  DATE_CATEGORIES,
} from '@/lib/calendar';

describe('categoryForDateType', () => {
  it('maps every critical-date type to exactly one category', () => {
    const allTypes = [
      'Expiration',
      'Renewal Option',
      'Rent Escalation',
      'CAM Reconciliation',
      'Security Deposit Return',
      'Insurance Certificate',
      'Estoppel Certificate',
    ] as const;

    const expected: Record<(typeof allTypes)[number], string> = {
      Expiration: 'Expiration',
      'Renewal Option': 'Renewal',
      'Rent Escalation': 'Escalation',
      'CAM Reconciliation': 'Notice',
      'Security Deposit Return': 'Other',
      'Insurance Certificate': 'Notice',
      'Estoppel Certificate': 'Notice',
    };

    for (const type of allTypes) {
      expect(categoryForDateType(type)).toBe(expected[type]);
    }
  });

  it('keeps the legend catalog and style maps complete (no undefined dots)', () => {
    for (const category of DATE_CATEGORIES) {
      expect(categoryDotClass[category]).toMatch(/^bg-/);
      expect(categoryBadgeTone[category]).toBeDefined();
    }
  });
});
