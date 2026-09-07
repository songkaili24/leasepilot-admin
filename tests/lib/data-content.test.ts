import { describe, expect, it } from 'vitest';
import {
  notes as allNotes,
  occupancyHistory,
  rentScheduleForLease,
  documents as allDocuments,
  documentsForLease,
  notesForLease,
  leases,
  leaseById,
  leasesByProperty,
  occupancyByProperty,
  properties,
  clausesForLease,
} from '@/lib/data';
import { addDays, diffInDays, toISODate } from '@/lib/dates';

const TODAY = toISODate(new Date());

describe('documents, notes, and clauses integrity', () => {
  it('files at least an original agreement per lease', () => {
    for (const lease of leases) {
      const docs = documentsForLease(lease.id);
      expect(docs.length).toBeGreaterThanOrEqual(2);
      expect(docs.some((d) => d.kind === 'Lease Agreement' && d.version === '1.0')).toBe(true);
    }
    expect(allDocuments.every((d) => leaseById(d.leaseId))).toBe(true);
  });

  it('threads notes: every reply points at an existing note on the same lease', () => {
    for (const lease of leases) {
      const notes = notesForLease(lease.id);
      const ids = new Set(notes.map((n) => n.id));
      for (const note of notes) {
        expect(note.author.trim()).not.toBe('');
        if (note.parentId !== null) expect(ids.has(note.parentId)).toBe(true);
      }
    }
    expect(allNotes.length).toBeGreaterThan(15);
  });

  it('abstracts the five headline clauses per lease', () => {
    for (const lease of leases) {
      const clauses = clausesForLease(lease);
      expect(clauses.map((c) => c.section)).toEqual(['2.3', '4.1', '6.1', '8.2', '9.4']);
    }
  });
});

describe('occupancy history and rent schedule math', () => {
  it('provides a bounded 13-month occupancy series', () => {
    expect(occupancyHistory).toHaveLength(13);
    for (const point of occupancyHistory) {
      expect(point.occupancy).toBeGreaterThan(0);
      expect(point.occupancy).toBeLessThanOrEqual(100);
      expect(point.month).toMatch(/^\d{4}-\d{2}$/);
    }
  });

  it('starts each lease year at commencement with unescalated rent', () => {
    const lease = leaseById('l-1');
    const rows = rentScheduleForLease(lease!);
    expect(rows[0].periodStart).toBe(lease!.commencementDate);
    expect(rows[0].monthlyRent).toBe(lease!.baseRentMonthly);
    expect(rows[0].escalationPct).toBe(0);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].escalationPct).toBe(lease!.annualEscalationPct);
      expect(rows[i].monthlyRent).toBeGreaterThan(rows[i - 1].monthlyRent);
    }
  });

  // [-BUG-] The schedule's period end is computed as commencement + (year*12 - 1)
  // MONTHS instead of (year*12) months minus one DAY, so every lease-year ends
  // roughly a month early and periods are not contiguous. Visible on the
  // Financial Obligations tab of any lease record.
  it('[-BUG rent-schedule] makes periods contiguous (next start = prev end + 1 day)', () => {
    const rows = rentScheduleForLease(leaseById('l-1')!);
    expect(rows.length).toBeGreaterThan(1);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].periodStart).toBe(addDays(rows[i - 1].periodEnd, 1));
    }
  });

  // [-BUG-] Term-based leases set expiration = today + termMonths instead of
  // commencement + termMonths. An 84-month term commenced 55 months ago shows
  // a ~139-month span, skewing expiration ladders, WALT, and the dashboard
  // expiring math for every non-expiring lease.
  it('[-BUG lease-term] sets expiration at commencement + term months', () => {
    const lease = leaseById('l-1')!; // spec: 84-month term commenced 55 months ago
    const months = Math.round(diffInDays(lease.commencementDate, lease.expirationDate) / 30.44);
    expect(months).toBe(84);
  });
});

describe('occupancy by property', () => {
  it('clamps occupancy to a plausible band', () => {
    for (const property of properties) {
      const occ = occupancyByProperty(property);
      expect(occ).toBeGreaterThanOrEqual(45);
      expect(occ).toBeLessThanOrEqual(98);
    }
  });

  it('counts terminated tenancies as vacant', () => {
    const prop4 = properties[3];
    const withTerminated = leasesByProperty(prop4.id).filter((l) => l.status !== 'Terminated');
    const manual = Math.min(
      98,
      Math.max(
        45,
        Math.round(
          (withTerminated.reduce((s, l) => s + l.rentableSf, 0) / prop4.grossFloorAreaSf) * 100,
        ),
      ),
    );
    expect(occupancyByProperty(prop4)).toBe(manual);
  });
});
