import { addDays } from '../dates';
import type {
  CriticalDate,
  CriticalDateType,
  Lease,
  LeaseClause,
  Obligation,
  ObligationCategory,
  VaultDocument,
} from '../types';
import { isoDate, pick, rngFor } from './internal';
import { pmNames, leases } from './leases';

/* ------------------------------------------------------------------ */
/* Critical dates                                                      */
/* ------------------------------------------------------------------ */

const criticalDateTypes: CriticalDateType[] = [
  'Expiration',
  'Renewal Option',
  'Rent Escalation',
  'CAM Reconciliation',
  'Security Deposit Return',
  'Insurance Certificate',
  'Estoppel Certificate',
];

function makeCriticalDate(lease: Lease, index: number): CriticalDate {
  const rng = rngFor(`critical-${lease.id}-${index}`);
  const type = pick(rng, criticalDateTypes);
  // Spread from 45 days overdue to ~22 months out; a share lands in the
  // amber/red alert windows.
  const offset = Math.floor(-45 + rng() * 720);
  const due = addDays(isoDate(new Date()), offset);
  const notes: Record<CriticalDateType, string> = {
    Expiration: `Primary term expires. Confirm renewal intent or begin holdover per Section 2.3.`,
    'Renewal Option': `Tenant must exercise in writing within the notice window. Route executed notice to the vault.`,
    'Rent Escalation': `Annual escalation adjusts Base Rent to the greater of ${lease.annualEscalationPct.toFixed(1)}% or CPI.`,
    'CAM Reconciliation': `Reconcile operating expense actuals against monthly estimates; true-up within 60 days of year-end.`,
    'Security Deposit Return': `Return security deposit less lawful deductions within 30 days of surrender.`,
    'Insurance Certificate': `Obtain replacement COI evidencing $2M CGL per occurrence naming Landlord as additional insured.`,
    'Estoppel Certificate': `Deliver estoppel in connection with portfolio refinancing; 10 business-day response window.`,
  };
  return {
    id: `cd-${lease.id}-${index}`,
    leaseId: lease.id,
    type,
    title: `${type} — ${lease.tenantName}`,
    dueDate: due,
    notes: notes[type],
  };
}

export const criticalDates: CriticalDate[] = leases.flatMap((lease) => {
  const rng = rngFor(`critical-count-${lease.id}`);
  const count = 2 + Math.floor(rng() * 3);
  return Array.from({ length: count }, (_, i) => makeCriticalDate(lease, i));
});

export function criticalDatesForLease(leaseId: string): CriticalDate[] {
  return criticalDates
    .filter((c) => c.leaseId === leaseId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

/* ------------------------------------------------------------------ */
/* Financial obligations                                               */
/* ------------------------------------------------------------------ */

const obligationTemplates: Array<{
  category: ObligationCategory;
  frequency: Obligation['frequency'];
  describe: (annual: number, escalation: number) => string;
}> = [
  {
    category: 'Base Rent',
    frequency: 'Monthly',
    describe: (annual, escalation) =>
      `Fixed Base Rent under Section 4.1; annual escalation of ${escalation.toFixed(1)}% each anniversary (${Math.round(
        annual / 12,
      ).toLocaleString('en-US')} USD/mo).`,
  },
  {
    category: 'CAM',
    frequency: 'Monthly',
    describe: () =>
      `Operating expense pass-throughs estimated monthly and reconciled annually against actual CAM.`,
  },
  {
    category: 'Real Estate Taxes',
    frequency: 'Quarterly',
    describe: () =>
      `Tenant proportionate share of real estate taxes, payable quarterly in advance.`,
  },
  {
    category: 'Insurance',
    frequency: 'Annual',
    describe: () => `Tenant liability and property insurance premium allocation per Section 8.2.`,
  },
  {
    category: 'Utilities',
    frequency: 'Monthly',
    describe: () => `Metered electric and water; tenant contracts directly with utility providers.`,
  },
  {
    category: 'Janitorial',
    frequency: 'Monthly',
    describe: () => `Standard daytime janitorial five nights per week, billed through management.`,
  },
  {
    category: 'Parking',
    frequency: 'Monthly',
    describe: () =>
      `Reserved garage stalls at the published monthly rate; ratio per lease exhibit.`,
  },
  {
    category: 'Percentage Rent',
    frequency: 'Quarterly',
    describe: () =>
      `Percentage rent on gross sales in excess of the natural breakpoint, reported quarterly.`,
  },
];

function makeObligation(lease: Lease, index: number): Obligation {
  const rng = rngFor(`obligation-${lease.id}-${index}`);
  const template = obligationTemplates[index % obligationTemplates.length];
  const share = 0.35 + rng() * 0.65;
  const annual =
    template.category === 'Base Rent'
      ? lease.baseRentMonthly * 12
      : Math.round((lease.camRecoveryAnnual / 4) * share);
  const dueOffsets: Record<Obligation['frequency'], number> = {
    Monthly: 3 + Math.floor(rng() * 10),
    Quarterly: 12 + Math.floor(rng() * 40),
    Annual: 40 + Math.floor(rng() * 120),
  };
  return {
    id: `ob-${lease.id}-${index}`,
    leaseId: lease.id,
    category: template.category,
    description: template.describe(annual, lease.annualEscalationPct),
    annualAmount: annual,
    frequency: template.frequency,
    nextDueDate: addDays(isoDate(new Date()), dueOffsets[template.frequency]),
    escalationPct: template.category === 'Base Rent' ? lease.annualEscalationPct : 0,
  };
}

export const obligations: Obligation[] = leases.flatMap((lease) => {
  const rng = rngFor(`obligation-count-${lease.id}`);
  const count = 3 + Math.floor(rng() * 3);
  return Array.from({ length: count }, (_, i) => makeObligation(lease, i));
});

export function obligationsForLease(leaseId: string): Obligation[] {
  return obligations.filter((o) => o.leaseId === leaseId);
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const docKinds: VaultDocument['kind'][] = [
  'Lease Agreement',
  'Amendment',
  'Estoppel',
  'SNDA',
  'COI',
  'Rent Roll',
  'Correspondence',
];

function makeDocuments(lease: Lease): VaultDocument[] {
  const rng = rngFor(`documents-${lease.id}`);
  const docs: VaultDocument[] = [
    {
      id: `doc-${lease.id}-0`,
      leaseId: lease.id,
      name: `${lease.leaseNumber} — Original Lease Agreement`,
      kind: 'Lease Agreement',
      sizeKb: 2400 + Math.floor(rng() * 3600),
      pages: 84 + Math.floor(rng() * 60),
      uploadedBy: lease.propertyManager,
      uploadedAt: lease.commencementDate,
      version: '1.0',
    },
  ];
  const extra = 1 + Math.floor(rng() * 3);
  for (let i = 1; i <= extra; i++) {
    const kind = pick(rng, docKinds.slice(1));
    docs.push({
      id: `doc-${lease.id}-${i}`,
      leaseId: lease.id,
      name: `${lease.leaseNumber} — ${kind}${i > 1 ? ` (No. ${i})` : ''}`,
      kind,
      sizeKb: 180 + Math.floor(rng() * 1400),
      pages: 4 + Math.floor(rng() * 24),
      uploadedBy: pick(rng, pmNames),
      uploadedAt: addDays(lease.commencementDate, 90 + Math.floor(rng() * 700)),
      version: `${i + 1}.0`,
    });
  }
  return docs;
}

export const documents: VaultDocument[] = leases.flatMap(makeDocuments);

export function documentsForLease(leaseId: string): VaultDocument[] {
  return documents.filter((d) => d.leaseId === leaseId);
}

/* ------------------------------------------------------------------ */
/* Lease clauses (document tabs)                                       */
/* ------------------------------------------------------------------ */

export function clausesForLease(lease: Lease): LeaseClause[] {
  const rng = rngFor(`clauses-${lease.id}`);
  return [
    {
      id: `${lease.id}-cl-1`,
      section: '2.3',
      title: 'Holdover',
      excerpt:
        'If Tenant remains in possession after expiration without a new agreement, Tenant shall be a month-to-month tenant at one hundred fifty percent (150%) of the last monthly Base Rent, without prejudice to Landlord’s right to possession.',
      page: 12 + Math.floor(rng() * 6),
    },
    {
      id: `${lease.id}-cl-2`,
      section: '4.1',
      title: 'Base Rent & Escalations',
      excerpt: `Tenant shall pay monthly Base Rent of ${Math.round(lease.baseRentMonthly).toLocaleString('en-US')} USD, increasing on each anniversary of the Commencement Date by ${lease.annualEscalationPct.toFixed(1)}%.`,
      page: 18 + Math.floor(rng() * 6),
    },
    {
      id: `${lease.id}-cl-3`,
      section: '6.1',
      title: 'Operating Expense Pass-Throughs',
      excerpt:
        'Tenant shall pay its Proportionate Share of increases in Operating Expenses above the Base Year, including CAM, real estate taxes, and management fees capped at three percent (3%) of gross receipts.',
      page: 31 + Math.floor(rng() * 8),
    },
    {
      id: `${lease.id}-cl-4`,
      section: '8.2',
      title: 'Insurance',
      excerpt:
        'Tenant shall carry Commercial General Liability insurance with limits of not less than Two Million Dollars ($2,000,000) per occurrence, naming Landlord as Additional Insured on a primary and non-contributory basis.',
      page: 44 + Math.floor(rng() * 6),
    },
    {
      id: `${lease.id}-cl-5`,
      section: '9.4',
      title: 'Assignment & Subletting',
      excerpt:
        'Tenant shall not assign or sublet without Landlord’s prior written consent, which shall not be unreasonably withheld. Landlord may recapture any proposed assignment upon fifteen (15) days’ notice.',
      page: 52 + Math.floor(rng() * 8),
    },
  ];
}
