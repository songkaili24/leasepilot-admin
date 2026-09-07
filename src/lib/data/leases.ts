import { addDays, addMonths } from '../dates';
import type { Lease, LeaseStatus, ObligationCategory, Property } from '../types';
import { isoDate, pick, rngFor } from './internal';
import { properties } from './properties';

interface TenantSpec {
  name: string;
  industry: string;
}

const tenantSpecs: TenantSpec[] = [
  { name: 'Halloran & Mercer LLP', industry: 'Legal services' },
  { name: 'Bramwell Financial Group', industry: 'Financial services' },
  { name: 'Cobalt Analytics Inc.', industry: 'Data & analytics' },
  { name: 'Redwood Health Partners', industry: 'Healthcare' },
  { name: 'Sutteridge Architecture', industry: 'Architecture' },
  { name: 'Kestrel Freight Solutions', industry: 'Logistics' },
  { name: 'Meridian Staffing Co.', industry: 'Staffing' },
  { name: 'Pallas Insurance Underwriters', industry: 'Insurance' },
  { name: 'Dunmore Clinical Labs', industry: 'Diagnostics' },
  { name: 'Ironbark Timber Trading', industry: 'Wholesale trade' },
  { name: 'Vantage Marketing Group', industry: 'Advertising' },
  { name: 'Northgate Engineering PC', industry: 'Engineering' },
  { name: 'Calderidge CPA Group', industry: 'Accounting' },
  { name: 'Bluewave Data Systems', industry: 'IT services' },
  { name: 'Fenwick Property Services', industry: 'Facilities' },
  { name: 'Ashcroft Consulting Ltd.', industry: 'Management consulting' },
  { name: 'Trueline Manufacturing', industry: 'Light manufacturing' },
  { name: 'Silver Birch Wellness', industry: 'Wellness' },
];

const statuses: LeaseStatus[] = [
  'Active',
  'Active',
  'Active',
  'Active',
  'Active',
  'Expiring',
  'Expiring',
  'Renewed',
  'Terminated',
];

export const pmNames = ['D. Okafor', 'S. Whitfield', 'M. Tanaka', 'R. Gutierrez'];
const brokerNames = ['C. McAllister', 'J. Lindqvist', 'A. Petrov', 'T. Boone'];

function makeLease(index: number): Lease {
  const rng = rngFor(`lease-${index}`);
  const property = properties[Math.floor(rng() * properties.length)];
  const tenant = tenantSpecs[index % tenantSpecs.length];
  const status = pick(rng, statuses);

  const commencement = addMonths(isoDate(new Date()), -Math.floor(24 + rng() * 72));
  const termMonths = 36 + Math.floor(rng() * 4) * 24; // 36–108 months
  let expiration = addMonths(commencement, termMonths);
  // Force a slice of the book into the amber/red expiry window so the
  // Expiring status and alert feeds have realistic spread.
  if (status === 'Expiring') {
    expiration = addDays(isoDate(new Date()), Math.floor(20 + rng() * 200));
  }
  const rentableSf = 2100 + Math.floor(rng() * 38) * 250; // 2,100 – 11,600 SF
  const baseRent = Math.round((26 + rng() * 18) * rentableSf) / 12; // $26–$44/SF/yr
  const escalation = [2.5, 3, 3.5, 4][Math.floor(rng() * 4)];
  const cam = Math.round((8 + rng() * 6) * rentableSf);
  const depositMonths = [1, 2, 3][Math.floor(rng() * 3)];

  const categories: ObligationCategory[] = [
    'Base Rent',
    'CAM',
    'Real Estate Taxes',
    'Insurance',
    pick(rng, ['Utilities', 'Janitorial', 'Parking'] as const),
  ];

  const renewalOptions =
    status === 'Terminated'
      ? []
      : Array.from({ length: 1 + Math.floor(rng() * 3) }, (_, i) => ({
          option: i + 1,
          noticeDeadline: addDays(expiration, -(180 + Math.floor(rng() * 120))),
          termYears: 5,
        }));

  return {
    id: `l-${index + 1}`,
    leaseNumber: `LV-${2020 + Math.floor(rng() * 5)}-${String(101 + index * 7).padStart(4, '0')}`,
    tenantName: tenant.name,
    propertyId: property.id,
    portfolioId: property.portfolioId,
    suite: `${100 + Math.floor(rng() * 30) * 50}${pick(rng, ['', '', 'A', 'B'])}`,
    rentableSf,
    status,
    commencementDate: commencement,
    expirationDate: expiration,
    baseRentMonthly: baseRent,
    securityDeposit: baseRent * depositMonths,
    annualEscalationPct: escalation,
    camRecoveryAnnual: cam,
    obligationCategories: categories,
    renewalOptions,
    brokerOfRecord: pick(rng, brokerNames),
    propertyManager: pick(rng, pmNames),
    updatedBy: pick(rng, pmNames),
    updatedAt: addDays(isoDate(new Date()), -Math.floor(rng() * 30)),
  };
}

export const leases: Lease[] = Array.from({ length: 24 }, (_, i) => makeLease(i));

export function leaseById(id: string): Lease | undefined {
  return leases.find((l) => l.id === id);
}

export function leasesByProperty(propertyId: string): Lease[] {
  return leases.filter((l) => l.propertyId === propertyId);
}

export function occupancyByProperty(property: Property): number {
  const leased = leasesByProperty(property.id).reduce((sum, l) => sum + l.rentableSf, 0);
  const pct = (leased / property.grossFloorAreaSf) * 100;
  // Mock leases cannot fully occupy large assets; clamp to a plausible band.
  return Math.min(98, Math.max(62, Math.round(pct)));
}
