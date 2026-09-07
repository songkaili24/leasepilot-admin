import type { BadgeTone } from '@/components/ui/Badge';
import type { CriticalDateType } from './types';

/**
 * Critical dates roll up into four headline categories for the calendar dots
 * and legend; anything else lands in "Other".
 */
export type DateCategory = 'Expiration' | 'Escalation' | 'Notice' | 'Renewal' | 'Other';

export function categoryForDateType(type: CriticalDateType): DateCategory {
  switch (type) {
    case 'Expiration':
      return 'Expiration';
    case 'Rent Escalation':
      return 'Escalation';
    case 'Renewal Option':
      return 'Renewal';
    case 'CAM Reconciliation':
    case 'Insurance Certificate':
    case 'Estoppel Certificate':
      return 'Notice';
    default:
      return 'Other';
  }
}

export const categoryDotClass: Record<DateCategory, string> = {
  Expiration: 'bg-red-600',
  Escalation: 'bg-teal-600',
  Notice: 'bg-amber-500',
  Renewal: 'bg-navy-600',
  Other: 'bg-slate-400',
};

export const categoryBadgeTone: Record<DateCategory, BadgeTone> = {
  Expiration: 'red',
  Escalation: 'teal',
  Notice: 'amber',
  Renewal: 'navy',
  Other: 'slate',
};

export const DATE_CATEGORIES: DateCategory[] = [
  'Expiration',
  'Escalation',
  'Notice',
  'Renewal',
  'Other',
];
