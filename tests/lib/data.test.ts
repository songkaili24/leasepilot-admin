import { describe, expect, it } from 'vitest';
import {
  auditEntries,
  platformUsers,
  workspaceSettings,
  activityEvents,
  leases,
  leaseById,
  criticalDates as allCriticalDates,
  criticalDatesForLease,
  obligations as allObligations,
  obligationsForLease,
  properties,
} from '@/lib/data';
import { leaseSpecs } from '@/lib/data/lease-specs';
import { diffInDays, toISODate } from '@/lib/dates';

const TODAY = toISODate(new Date());

describe('portfolio shape (spec: 15 leases across 4 properties)', () => {
  it('has exactly 15 leases and 4 properties', () => {
    expect(leases).toHaveLength(15);
    expect(properties).toHaveLength(4);
    expect(leaseSpecs).toHaveLength(15);
  });

  it('demonstrates urgency: exactly 3 leases expire within 90 days', () => {
    const expiring = leases.filter((l) => {
      const days = diffInDays(TODAY, l.expirationDate);
      return (l.status === 'Active' || l.status === 'Expiring') && days >= 0 && days <= 90;
    });
    expect(expiring).toHaveLength(3);
    for (const lease of expiring) {
      expect(lease.status).toBe('Expiring');
    }
  });

  it('uses unique, canonical lease numbers', () => {
    const numbers = leases.map((l) => l.leaseNumber);
    expect(new Set(numbers).size).toBe(15);
    for (const n of numbers) expect(n).toMatch(/^LV-\d{4}-\d{4}$/);
  });

  it('keeps tenant, rent, and area data plausible', () => {
    for (const lease of leases) {
      expect(lease.tenantName.trim()).not.toBe('');
      expect(lease.rentableSf).toBeGreaterThan(0);
      expect(lease.baseRentMonthly).toBeGreaterThan(0);
      expect(lease.securityDeposit).toBeGreaterThanOrEqual(lease.baseRentMonthly);
      expect(lease.annualEscalationPct).toBeGreaterThanOrEqual(0);
      expect(lease.permittedUse.trim()).not.toBe('');
      expect(lease.expirationDate > lease.commencementDate).toBe(true);
    }
  });

  it('covers the requested tenant archetypes (law, tech, medical, retail)', () => {
    const tenants = leaseSpecs.map((s) => s.tenant).join(' | ');
    expect(tenants).toContain('LLP'); // law firm
    expect(tenants).toContain('Analytics'); // tech
    expect(tenants).toContain('Health'); // medical
    expect(tenants).toContain('Roasters'); // retail
  });
});

describe('critical dates (spec: 5-8 per lease)', () => {
  it('gives every lease between 5 and 8 dates spanning the term', () => {
    for (const lease of leases) {
      const dates = criticalDatesForLease(lease.id);
      expect(dates.length).toBeGreaterThanOrEqual(5);
      expect(dates.length).toBeLessThanOrEqual(8);
    }
  });

  it('references only real leases with unique ids, sorted ascending', () => {
    const ids = allCriticalDates.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const date of allCriticalDates) {
      expect(leaseById(date.leaseId)).toBeDefined();
    }
    for (const lease of leases) {
      const dates = criticalDatesForLease(lease.id).map((d) => d.dueDate);
      expect([...dates].sort()).toEqual(dates);
    }
  });

  it('mirrors expirations: expiring leases carry an Expiration date equal to the term end', () => {
    for (const lease of leases.filter(
      (l) => l.status === 'Expiring' || l.status === 'Terminated',
    )) {
      const dates = criticalDatesForLease(lease.id);
      expect(dates.some((d) => d.type === 'Expiration' && d.dueDate === lease.expirationDate)).toBe(
        true,
      );
    }
  });

  it('mirrors every renewal option notice deadline', () => {
    for (const lease of leases) {
      for (const option of lease.renewalOptions) {
        const dates = criticalDatesForLease(lease.id);
        expect(
          dates.some((d) => d.type === 'Renewal Option' && d.dueDate === option.noticeDeadline),
        ).toBe(true);
      }
    }
  });

  it('keeps escalation anniversaries in the future (next anniversary)', () => {
    for (const lease of leases) {
      if (lease.status === 'Terminated') continue;
      const escalation = criticalDatesForLease(lease.id).find((d) => d.type === 'Rent Escalation');
      expect(escalation).toBeDefined();
      expect(escalation!.dueDate >= TODAY).toBe(true);
    }
  });
});

describe('financial obligations', () => {
  it('charges Base Rent on every lease with positive amounts', () => {
    for (const lease of leases) {
      const rows = obligationsForLease(lease.id);
      const baseRent = rows.filter((o) => o.category === 'Base Rent');
      expect(baseRent.length).toBe(1);
      expect(baseRent[0].annualAmount).toBe(Math.round(lease.baseRentMonthly * 12));
      for (const row of rows) expect(row.annualAmount).toBeGreaterThan(0);
    }
  });

  it('escrows taxes for some tenants and passes through for others', () => {
    const escrows = allObligations.filter((o) => o.category === 'Tax Escrow');
    const passthroughs = allObligations.filter((o) => o.category === 'Real Estate Taxes');
    expect(escrows.length).toBeGreaterThan(0);
    expect(passthroughs.length).toBeGreaterThan(0);
  });

  it('keeps the terminated tenancy with an overdue settlement (audit realism)', () => {
    const terminated = leaseById('l-15');
    expect(terminated?.status).toBe('Terminated');
    const baseRent = obligationsForLease('l-15')[0];
    expect(baseRent.nextDueDate < TODAY).toBe(true);
  });
});

describe('audit log data', () => {
  it('is append-only ordered, most recent first, with unique ids', () => {
    expect(auditEntries.length).toBeGreaterThan(40);
    for (let i = 1; i < auditEntries.length; i++) {
      expect(auditEntries[i - 1].at >= auditEntries[i].at).toBe(true);
    }
    expect(new Set(auditEntries.map((e) => e.id)).size).toBe(auditEntries.length);
  });

  it('captures actor, action, record, and detail on every entry', () => {
    for (const entry of auditEntries) {
      expect(entry.actor.trim()).not.toBe('');
      expect(entry.action).toBeTruthy();
      expect(entry.record.trim()).not.toBe('');
      expect(entry.detail.trim()).not.toBe('');
      expect(['web', 'api']).toContain(entry.source);
    }
  });

  it('records the audit-critical event classes (sign-ins, changes, admin actions)', () => {
    const actions = new Set(auditEntries.map((e) => e.action));
    for (const required of [
      'Sign-in',
      'Lease created',
      'Lease updated',
      'Document upload',
      'Settings change',
      'Role change',
    ]) {
      expect(actions.has(required as never)).toBe(true);
    }
  });

  it('documents the invited and suspended accounts', () => {
    for (const user of platformUsers.filter((u) => u.status === 'Invited')) {
      expect(auditEntries.some((e) => e.action === 'User invited' && e.record === user.name)).toBe(
        true,
      );
    }
    for (const user of platformUsers.filter((u) => u.status === 'Suspended')) {
      expect(auditEntries.some((e) => e.action === 'Role change' && e.record === user.name)).toBe(
        true,
      );
    }
  });
});

describe('platform users and activity feed', () => {
  it('limits roles to the three documented seats', () => {
    for (const user of platformUsers) {
      expect(['Admin', 'Property Manager', 'Read-Only']).toContain(user.role);
      expect(user.status).toBeTruthy();
      if (user.status === 'Invited') expect(user.lastActiveAt).toBeNull();
    }
  });

  it('keeps the activity feed newest-first with resolvable leases', () => {
    for (let i = 1; i < activityEvents.length; i++) {
      expect(activityEvents[i - 1].at >= activityEvents[i].at).toBe(true);
    }
    for (const event of activityEvents) {
      expect(leaseById(event.leaseId)).toBeDefined();
    }
  });
});

describe('workspace settings', () => {
  it('encodes the documented security posture', () => {
    expect(workspaceSettings.auditLogImmutable).toBe(true);
    expect(workspaceSettings.auditLogRetentionYears).toBe(7);
    expect(workspaceSettings.requireSsoForAllUsers).toBe(true);
    expect(workspaceSettings.enforcePdfOnlyUploads).toBe(true);
    expect(workspaceSettings.maxUploadSizeMb).toBe(10);
    expect(workspaceSettings.documentRetentionYears).toBeGreaterThanOrEqual(3);
  });
});
