import { criticalDates, documents, leases, obligations, portfolios, properties } from './data';
import type { CriticalDate, Lease, Obligation, VaultDocument } from './types';

export interface SearchHit {
  id: string;
  kind: 'Lease' | 'Tenant' | 'Property';
  label: string;
  sublabel: string;
  href: string;
}

/**
 * Client-side global search over leases, tenants, and properties. Case-
 * insensitive substring match on name/number plus property city/state.
 */
export function searchEverything(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const propertyById = new Map(properties.map((p) => [p.id, p]));

  const leaseHits: SearchHit[] = leases
    .map((lease: Lease) => {
      const property = propertyById.get(lease.propertyId);
      return { lease, property };
    })
    .filter(({ lease, property }) => {
      const haystack = [
        lease.leaseNumber,
        lease.tenantName,
        property?.name ?? '',
        property?.city ?? '',
        property?.state ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .map(({ lease, property }) => ({
      id: `lease-${lease.id}`,
      kind: lease.tenantName.toLowerCase().includes(q) ? ('Tenant' as const) : ('Lease' as const),
      label: lease.tenantName,
      sublabel: `${lease.leaseNumber} · ${property?.name ?? ''} · Suite ${lease.suite}`,
      href: `/leases/${lease.id}`,
    }));

  const propertyHits: SearchHit[] = properties
    .filter((p) => `${p.name} ${p.city} ${p.state}`.toLowerCase().includes(q))
    .map((p) => ({
      id: `prop-${p.id}`,
      kind: 'Property' as const,
      label: p.name,
      sublabel: `${p.address}, ${p.city}, ${p.state} · ${p.type}`,
      href: `/properties/${p.id}`,
    }));

  return [...leaseHits, ...propertyHits].slice(0, limit);
}

export interface UpcomingDate extends CriticalDate {
  leaseNumber: string;
  tenantName: string;
}

/** All critical dates joined with their lease, sorted soonest first. */
export function allUpcomingDates(): UpcomingDate[] {
  const byId = new Map(leases.map((l) => [l.id, l]));
  return criticalDates
    .map((c) => {
      const lease = byId.get(c.leaseId);
      if (!lease) return null;
      return { ...c, leaseNumber: lease.leaseNumber, tenantName: lease.tenantName };
    })
    .filter((c): c is UpcomingDate => c !== null)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export interface DocumentRow extends VaultDocument {
  leaseNumber: string;
  tenantName: string;
}

/** All vault documents joined with their lease. */
export function allDocuments(): DocumentRow[] {
  const byId = new Map(leases.map((l) => [l.id, l]));
  return documents
    .map((d) => {
      const lease = byId.get(d.leaseId);
      if (!lease) return null;
      return { ...d, leaseNumber: lease.leaseNumber, tenantName: lease.tenantName };
    })
    .filter((d): d is DocumentRow => d !== null);
}

export interface ObligationRow extends Obligation {
  leaseNumber: string;
  tenantName: string;
}

/** All obligations joined with their lease. */
export function allObligations(): ObligationRow[] {
  const byId = new Map(leases.map((l) => [l.id, l]));
  return obligations
    .map((o) => {
      const lease = byId.get(o.leaseId);
      if (!lease) return null;
      return {
        ...o,
        leaseNumber: lease.leaseNumber,
        tenantName: lease.tenantName,
      };
    })
    .filter((o): o is ObligationRow => o !== null);
}
