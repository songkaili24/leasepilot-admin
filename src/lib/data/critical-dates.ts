import { addDays, addMonths, diffInDays } from '../dates';
import type { CriticalDate, CriticalDateType, Lease } from '../types';
import { isoDate, pick, rngFor } from './internal';
import { leases } from './leases';

const TODAY = isoDate(new Date());
const day = (n: number) => addDays(TODAY, n);
/* ------------------------------------------------------------------ */
/* Critical dates — 5 to 8 per lease spanning the term                 */
/* ------------------------------------------------------------------ */

const PADDING_TYPES: Array<{ type: CriticalDateType; notes: string }> = [
  {
    type: 'Estoppel Certificate',
    notes:
      'Deliver estoppel in connection with portfolio refinancing; 10 business-day response window.',
  },
  {
    type: 'Security Deposit Return',
    notes: 'Return security deposit less lawful deductions within 30 days of surrender.',
  },
  {
    type: 'CAM Reconciliation',
    notes: 'Interim operating expense review; confirm tenant pro-rata share and exclusions.',
  },
  {
    type: 'Insurance Certificate',
    notes: 'Verify CGL limits and additional-insured endorsement remain in force.',
  },
];

/** Next lease-year anniversary on or after today (escalation effective date). */
function nextEscalationDate(lease: Lease): string {
  const elapsedMonths = Math.max(0, Math.round(diffInDays(lease.commencementDate, TODAY) / 30.44));
  const anniversaries = Math.floor(elapsedMonths / 12) + 1;
  return addMonths(lease.commencementDate, anniversaries * 12);
}

function makeCriticalDates(lease: Lease): CriticalDate[] {
  const rng = rngFor(`cd-${lease.id}`);
  const list: CriticalDate[] = [];
  const push = (type: CriticalDateType, dueDate: string, notes: string) =>
    list.push({
      id: `cd-${lease.id}-${list.length}`,
      leaseId: lease.id,
      type,
      title: `${type} — ${lease.tenantName}`,
      dueDate,
      notes,
    });

  // Structural dates every abstract carries.
  push(
    'Rent Escalation',
    nextEscalationDate(lease),
    `Annual escalation adjusts Base Rent to the greater of ${lease.annualEscalationPct.toFixed(1)}% or CPI, effective on the lease-year anniversary.`,
  );
  push(
    'CAM Reconciliation',
    day(25 + Math.floor(rng() * 60)),
    'Reconcile operating expense actuals against monthly estimates; true-up invoice due within 60 days of year-end close.',
  );
  push(
    'Insurance Certificate',
    day(60 + Math.floor(rng() * 120)),
    'Obtain replacement COI evidencing $2M CGL per occurrence naming Landlord as additional insured on a primary and non-contributory basis.',
  );

  // Expiration appears once the term is inside a 24-month horizon.
  if (diffInDays(TODAY, lease.expirationDate) <= 730) {
    push(
      'Expiration',
      lease.expirationDate,
      'Primary term expires. Confirm renewal intent or begin holdover per Section 2.3 (150% of last monthly Base Rent).',
    );
  }

  for (const option of lease.renewalOptions) {
    push(
      'Renewal Option',
      option.noticeDeadline,
      `Tenant must exercise Option ${option.option} in writing for a ${option.termYears}-year term within the notice window; route executed notice to the vault.`,
    );
  }

  if (lease.status === 'Terminated') {
    push(
      'Security Deposit Return',
      day(10),
      'Term concluded. Return security deposit less lawful deductions and documented damages within 30 days of surrender.',
    );
  }

  // Pad to the 5–8 range with seeded ancillary deadlines.
  const target = 5 + Math.floor(rng() * 4);
  while (list.length < target) {
    const template = pick(rng, PADDING_TYPES);
    push(template.type, day(Math.floor(-30 + rng() * 700)), template.notes);
  }
  return list.slice(0, 8);
}

export const criticalDates: CriticalDate[] = leases.flatMap(makeCriticalDates);

export function criticalDatesForLease(leaseId: string): CriticalDate[] {
  return criticalDates
    .filter((c) => c.leaseId === leaseId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
