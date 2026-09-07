import { addDays } from '../dates';
import type { ActivityEvent, Lease, LeaseNote, OccupancyPoint } from '../types';
import { isoDate, pick, rngFor } from './internal';
import { leases } from './leases';
import { pmNames } from './lease-specs';

const TODAY = isoDate(new Date());
const day = (n: number) => addDays(TODAY, n);
/* ------------------------------------------------------------------ */
/* Notes — threaded, with authors and timestamps                       */
/* ------------------------------------------------------------------ */

const NOTE_THREADS: Array<{ role: string; body: string; replies: string[] }> = [
  {
    role: 'Asset Manager',
    body: 'Tenant requested a rent commencement deferral of 60 days in exchange for a longer tail on the term. Circulated to ownership for direction.',
    replies: [
      'Ownership is open to a deferral if the escalation schedule remains intact. Drafting a side letter.',
      'Side letter executed and uploaded to the vault; abstract updated to reflect the revised commencement.',
    ],
  },
  {
    role: 'Lease Analyst',
    body: 'CAM reconciliation draft shows a true-up in the tenant’s favor this cycle — janitorial under-recovery offset by lower snow removal.',
    replies: ['Confirmed with accounting. Reconciliation letter scheduled for month-end send.'],
  },
  {
    role: 'Property Manager',
    body: 'Renewal notice window opens in roughly two months. Flagging early so we can price the option against market comps.',
    replies: [
      'Broker comps are in the Reports workspace. Recommend targeting a 4% bump on the renewed term.',
    ],
  },
  {
    role: 'Lease Analyst',
    body: 'Tenant COI shows an expired additional-insured endorsement. Requested a corrected certificate from the broker.',
    replies: ['Corrected COI received and filed. Compliance gap closed.'],
  },
  {
    role: 'Asset Manager',
    body: 'Holdover exposure quantified at 150% of last Base Rent per Section 2.3 if the term lapses without renewal.',
    replies: [],
  },
];

function makeNotes(lease: Lease): LeaseNote[] {
  const rng = rngFor(`notes-${lease.id}`);
  const notes: LeaseNote[] = [];
  let seq = 0;
  const threadCount = 1 + Math.floor(rng() * 2);
  const threads = [...NOTE_THREADS].sort(() => rng() - 0.5).slice(0, threadCount);
  for (const thread of threads) {
    const rootAt = day(-(5 + Math.floor(rng() * 55)));
    const rootId = `note-${lease.id}-${seq++}`;
    notes.push({
      id: rootId,
      leaseId: lease.id,
      author: pick(rng, pmNames),
      authorRole: thread.role,
      createdAt: `${rootAt}T09:${String(10 + (seq % 4) * 9).padStart(2, '0')}:00`,
      body: thread.body,
      parentId: null,
    });
    for (let r = 0; r < thread.replies.length; r++) {
      notes.push({
        id: `note-${lease.id}-${seq++}`,
        leaseId: lease.id,
        author: pick(rng, pmNames),
        authorRole: r === 0 ? 'Property Manager' : 'Lease Analyst',
        createdAt: `${addDays(rootAt, 1 + r * 2)}T14:${String(5 + r * 12).padStart(2, '0')}:00`,
        body: thread.replies[r],
        parentId: rootId,
      });
    }
  }
  return notes;
}

export const notes: LeaseNote[] = leases.flatMap(makeNotes);

export function notesForLease(leaseId: string): LeaseNote[] {
  return notes.filter((n) => n.leaseId === leaseId);
}

/* ------------------------------------------------------------------ */
/* Activity feed — portfolio-wide, most recent first                   */
/* ------------------------------------------------------------------ */

const ACTIVITIES: Array<{
  kind: ActivityEvent['kind'];
  summary: (lease: Lease) => string;
}> = [
  {
    kind: 'Amendment',
    summary: (l) =>
      `First amendment fully executed for ${l.tenantName} — restated escalation schedule`,
  },
  {
    kind: 'Document',
    summary: (l) => `COI renewal uploaded for ${l.leaseNumber} evidencing $2M CGL per occurrence`,
  },
  {
    kind: 'Status',
    summary: (l) => `${l.tenantName} status changed to Renewed following timely option exercise`,
  },
  { kind: 'Payment', summary: (l) => `CAM true-up payment posted for ${l.leaseNumber}` },
  { kind: 'Deadline', summary: (l) => `Renewal option notice deadline logged for ${l.tenantName}` },
  {
    kind: 'Document',
    summary: (l) => `Estoppel certificate executed and filed for ${l.tenantName}`,
  },
  {
    kind: 'Status',
    summary: (l) => `${l.tenantName} moved to Expiring as the term entered the 90-day window`,
  },
  {
    kind: 'Amendment',
    summary: (l) => `Security deposit increase letter issued to ${l.tenantName}`,
  },
  {
    kind: 'Payment',
    summary: (l) => `Monthly tax escrow remittance confirmed for ${l.leaseNumber}`,
  },
  {
    kind: 'Document',
    summary: (l) => `SNDA uploaded for ${l.tenantName} in connection with the refinancing`,
  },
];

function makeActivity(lease: Lease, index: number): ActivityEvent[] {
  const rng = rngFor(`activity-${lease.id}`);
  const count = 1 + Math.floor(rng() * 2);
  return Array.from({ length: count }, (_, i) => {
    const template = ACTIVITIES[(index * 3 + i) % ACTIVITIES.length];
    const at = day(-(1 + Math.floor(rng() * 21)));
    return {
      id: `act-${lease.id}-${i}`,
      kind: template.kind,
      leaseId: lease.id,
      summary: template.summary(lease),
      actor: pick(rng, pmNames),
      at: `${at}T${String(9 + ((index + i) % 8)).padStart(2, '0')}:${String((index * 13 + i * 7) % 60).padStart(2, '0')}:00`,
    };
  });
}

export const activityEvents: ActivityEvent[] = leases
  .flatMap(makeActivity)
  .sort((a, b) => b.at.localeCompare(a.at));
