import { addDays, addMonths } from '../dates';
import type { Lease, ObligationCategory } from '../types';
import { isoDate } from './internal';
import { leaseSpecs, pmContacts } from './lease-specs';
import { properties } from './properties';

const BROKERS = ['C. McAllister', 'J. Lindqvist', 'A. Petrov', 'T. Boone'];
const TODAY = isoDate(new Date());
const day = (n: number) => addDays(TODAY, n);
const monthsAgo = (n: number) => addMonths(TODAY, -n);
const monthsAhead = (n: number) => addMonths(TODAY, n);

const EXTRA_CATEGORIES: ObligationCategory[] = [
  'Utilities',
  'Janitorial',
  'Parking',
  'Percentage Rent',
];

export const leases: Lease[] = leaseSpecs.map((spec, index) => {
  const contact = pmContacts[spec.pm];
  const baseRentMonthly = Math.round((spec.annualRatePerSf * spec.rentableSf) / 12);
  const commencement = monthsAgo(spec.commencedMonthsAgo);
  const expiration =
    spec.expiresInDays !== undefined ? day(spec.expiresInDays) : monthsAhead(spec.termMonths ?? 60);

  return {
    id: `l-${index + 1}`,
    leaseNumber: spec.leaseNumber,
    tenantName: spec.tenant,
    propertyId: spec.propertyId,
    portfolioId: properties.find((p) => p.id === spec.propertyId)?.portfolioId ?? 'p-1',
    suite: spec.suite,
    rentableSf: spec.rentableSf,
    status: spec.status,
    commencementDate: commencement,
    expirationDate: expiration,
    baseRentMonthly,
    securityDeposit: baseRentMonthly * spec.depositMonths,
    annualEscalationPct: spec.annualEscalationPct,
    camRecoveryAnnual: Math.round(spec.rentableSf * (8 + (index % 4))),
    obligationCategories: [
      'Base Rent',
      'CAM',
      spec.status === 'Active' && index % 2 === 0 ? 'Tax Escrow' : 'Real Estate Taxes',
      'Insurance',
      EXTRA_CATEGORIES[index % EXTRA_CATEGORIES.length],
    ] as ObligationCategory[],
    renewalOptions: (spec.options ?? []).map((option, i) => ({
      option: i + 1,
      noticeDeadline: day(option.noticeInDays),
      termYears: option.termYears,
    })),
    brokerOfRecord: BROKERS[index % BROKERS.length],
    propertyManager: contact.name,
    propertyManagerContact: contact,
    permittedUse: spec.permittedUse,
    updatedBy: contact.name,
    updatedAt: day(-(2 + ((index * 7) % 26))),
  };
});

export function leaseById(id: string): Lease | undefined {
  return leases.find((l) => l.id === id);
}

export function leasesByProperty(propertyId: string): Lease[] {
  return leases.filter((l) => l.propertyId === propertyId);
}

export function occupancyByProperty(property: { id: string; grossFloorAreaSf: number }): number {
  const leased = leasesByProperty(property.id).reduce(
    (sum, l) => sum + (l.status === 'Terminated' ? 0 : l.rentableSf),
    0,
  );
  const pct = (leased / property.grossFloorAreaSf) * 100;
  return Math.min(98, Math.max(45, Math.round(pct)));
}
