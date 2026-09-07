import { addDays } from '../dates';
import type { Lease, Obligation, ObligationCategory } from '../types';
import { isoDate, rngFor } from './internal';
import { leases } from './leases';

const TODAY = isoDate(new Date());
const day = (n: number) => addDays(TODAY, n);
/* ------------------------------------------------------------------ */
/* Financial obligations                                               */
/* ------------------------------------------------------------------ */

const obligationTemplates: Array<{
  category: ObligationCategory;
  frequency: Obligation['frequency'];
  describe: (annual: number, lease: Lease) => string;
}> = [
  {
    category: 'Base Rent',
    frequency: 'Monthly',
    describe: (annual, lease) =>
      `Fixed Base Rent under Section 4.1; annual escalation of ${lease.annualEscalationPct.toFixed(1)}% each lease-year anniversary (${Math.round(annual / 12).toLocaleString('en-US')} USD/mo).`,
  },
  {
    category: 'CAM',
    frequency: 'Monthly',
    describe: () =>
      'Operating expense pass-throughs estimated monthly and reconciled annually against actual CAM per Section 6.1.',
  },
  {
    category: 'Real Estate Taxes',
    frequency: 'Quarterly',
    describe: () =>
      'Tenant proportionate share of real estate taxes, payable quarterly in advance.',
  },
  {
    category: 'Tax Escrow',
    frequency: 'Monthly',
    describe: () =>
      'Monthly tax escrow deposits remitted to Landlord’s tax servicer; escrow adjusted after each tax-year close.',
  },
  {
    category: 'Insurance',
    frequency: 'Annual',
    describe: () => 'Tenant liability and property insurance premium allocation per Section 8.2.',
  },
  {
    category: 'Utilities',
    frequency: 'Monthly',
    describe: () => 'Metered electric and water; tenant contracts directly with utility providers.',
  },
  {
    category: 'Janitorial',
    frequency: 'Monthly',
    describe: () => 'Standard daytime janitorial five nights per week, billed through management.',
  },
  {
    category: 'Parking',
    frequency: 'Monthly',
    describe: () =>
      'Reserved garage stalls at the published monthly rate; ratio per lease exhibit.',
  },
  {
    category: 'Percentage Rent',
    frequency: 'Quarterly',
    describe: () =>
      'Percentage rent on gross sales in excess of the natural breakpoint, reported and paid quarterly.',
  },
];

function makeObligations(lease: Lease): Obligation[] {
  const rng = rngFor(`ob-${lease.id}`);
  const categories: ObligationCategory[] = ['Base Rent', 'CAM', 'Insurance'];
  // Recovery structures differ: some tenants escrow taxes, others pay pass-through.
  categories.push(
    lease.obligationCategories.includes('Tax Escrow') ? 'Tax Escrow' : 'Real Estate Taxes',
  );
  const extras = lease.obligationCategories.filter(
    (c) => c === 'Utilities' || c === 'Janitorial' || c === 'Parking' || c === 'Percentage Rent',
  );
  categories.push(...extras);

  return categories.map((category, index) => {
    const template = obligationTemplates.find((t) => t.category === category)!;
    const share = 0.35 + rng() * 0.65;
    const annual =
      category === 'Base Rent'
        ? lease.baseRentMonthly * 12
        : Math.round((lease.camRecoveryAnnual / 4) * share);
    const dueOffsets: Record<Obligation['frequency'], number> = {
      Monthly: 3 + Math.floor(rng() * 10),
      Quarterly: 12 + Math.floor(rng() * 40),
      Annual: 40 + Math.floor(rng() * 120),
    };
    // The terminated tenancy carries one overdue final settlement.
    const nextDueDate =
      lease.status === 'Terminated' && index === 0 ? day(-12) : day(dueOffsets[template.frequency]);
    return {
      id: `ob-${lease.id}-${index}`,
      leaseId: lease.id,
      category,
      description: template.describe(annual, lease),
      annualAmount: annual,
      frequency: template.frequency,
      nextDueDate,
      escalationPct: category === 'Base Rent' ? lease.annualEscalationPct : 0,
    };
  });
}

export const obligations: Obligation[] = leases.flatMap(makeObligations);

export function obligationsForLease(leaseId: string): Obligation[] {
  return obligations.filter((o) => o.leaseId === leaseId);
}
