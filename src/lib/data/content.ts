import { addDays, addMonths, diffInDays } from '../dates';
import type { Lease, LeaseClause, OccupancyPoint, RentScheduleRow, VaultDocument } from '../types';
import { isoDate, pick, rngFor } from './internal';
import { leases } from './leases';
import { pmNames } from './lease-specs';

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

const docKinds: VaultDocument['kind'][] = [
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
/* Lease clauses (Overview reference)                                  */
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
      excerpt: `Tenant shall pay monthly Base Rent of ${Math.round(lease.baseRentMonthly).toLocaleString('en-US')} USD, increasing on each lease-year anniversary by ${lease.annualEscalationPct.toFixed(1)}%.`,
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

/* ------------------------------------------------------------------ */
/* Portfolio occupancy history (13 months)                             */
/* ------------------------------------------------------------------ */

const OCCUPANCY_TREND = [
  86.2, 86.9, 87.5, 88.1, 88.0, 88.8, 89.5, 90.2, 89.8, 91.0, 91.6, 92.1, 92.4,
];

export const occupancyHistory: OccupancyPoint[] = OCCUPANCY_TREND.map((occupancy, i) => {
  const d = new Date();
  d.setDate(1);
  const month = addMonths(isoDate(d), -(OCCUPANCY_TREND.length - 1 - i));
  return { month: month.slice(0, 7), occupancy };
});

/* ------------------------------------------------------------------ */
/* Rent schedule — escalation ladder for one lease                     */
/* ------------------------------------------------------------------ */

export function rentScheduleForLease(lease: Lease): RentScheduleRow[] {
  const rows: RentScheduleRow[] = [];
  const start = new Date(`${lease.commencementDate}T00:00:00`);
  const termMonths = Math.min(
    120,
    Math.max(12, Math.round(diffInDays(lease.commencementDate, lease.expirationDate) / 30.44)),
  );
  const years = Math.ceil(termMonths / 12);
  for (let year = 1; year <= years; year++) {
    const periodStart = addMonths(isoDate(start), (year - 1) * 12);
    const periodEnd = addMonths(isoDate(start), year * 12 - 1);
    const monthlyRent = Math.round(
      lease.baseRentMonthly * Math.pow(1 + lease.annualEscalationPct / 100, year - 1),
    );
    rows.push({
      leaseYear: year,
      periodStart,
      periodEnd,
      monthlyRent,
      annualRent: monthlyRent * 12,
      escalationPct: year === 1 ? 0 : lease.annualEscalationPct,
    });
  }
  return rows;
}
