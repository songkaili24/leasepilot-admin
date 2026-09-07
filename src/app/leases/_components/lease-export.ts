import { portfolioName, properties } from '@/lib/data';
import type { Lease } from '@/lib/types';

const propertyById = new Map(properties.map((p) => [p.id, p]));

export const CSV_HEADERS = [
  'Lease ID',
  'Tenant',
  'Property',
  'Suite',
  'Rentable SF',
  'Start Date',
  'Expiry Date',
  'Monthly Rent (USD)',
  'Annual Escalation %',
  'Status',
  'Portfolio',
  'Property Manager',
];

export function leaseToCsvRow(lease: Lease): string[] {
  const property = propertyById.get(lease.propertyId);
  return [
    lease.leaseNumber,
    lease.tenantName,
    property?.name ?? '',
    lease.suite,
    String(lease.rentableSf),
    lease.commencementDate,
    lease.expirationDate,
    String(Math.round(lease.baseRentMonthly)),
    String(lease.annualEscalationPct),
    lease.status,
    portfolioName(lease.portfolioId),
    lease.propertyManager,
  ];
}
