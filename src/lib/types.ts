export type LeaseStatus = 'Active' | 'Expiring' | 'Renewed' | 'Terminated';

export type PropertyType =
  'Office' | 'Retail' | 'Industrial' | 'Flex' | 'Medical Office' | 'Data Center';

export type CriticalDateType =
  | 'Expiration'
  | 'Renewal Option'
  | 'Rent Escalation'
  | 'CAM Reconciliation'
  | 'Security Deposit Return'
  | 'Insurance Certificate'
  | 'Estoppel Certificate';

export type ObligationCategory =
  | 'Base Rent'
  | 'CAM'
  | 'Real Estate Taxes'
  | 'Insurance'
  | 'Utilities'
  | 'Janitorial'
  | 'Parking'
  | 'Percentage Rent';

export interface Portfolio {
  id: string;
  name: string;
  code: string;
  propertyCount: number;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  type: PropertyType;
  grossFloorAreaSf: number;
  portfolioId: string;
}

export interface LeaseClause {
  id: string;
  section: string;
  title: string;
  excerpt: string;
  page: number;
}

export interface Lease {
  id: string;
  /** Canonical lease number, e.g. LV-2024-0482. Rendered in IBM Plex Mono. */
  leaseNumber: string;
  tenantName: string;
  propertyId: string;
  portfolioId: string;
  suite: string;
  rentableSf: number;
  status: LeaseStatus;
  commencementDate: string;
  expirationDate: string;
  baseRentMonthly: number;
  securityDeposit: number;
  annualEscalationPct: number;
  camRecoveryAnnual: number;
  obligationCategories: ObligationCategory[];
  renewalOptions: Array<{ option: number; noticeDeadline: string; termYears: number }>;
  brokerOfRecord: string;
  propertyManager: string;
  updatedBy: string;
  updatedAt: string;
}

export interface CriticalDate {
  id: string;
  leaseId: string;
  type: CriticalDateType;
  title: string;
  dueDate: string;
  notes: string;
}

export interface Obligation {
  id: string;
  leaseId: string;
  category: ObligationCategory;
  description: string;
  annualAmount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  nextDueDate: string;
  escalationPct: number;
}

export interface VaultDocument {
  id: string;
  leaseId: string;
  name: string;
  kind:
    'Lease Agreement' | 'Amendment' | 'Estoppel' | 'SNDA' | 'COI' | 'Rent Roll' | 'Correspondence';
  sizeKb: number;
  pages: number;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
}

export interface LeaseStatusCount {
  status: LeaseStatus;
  count: number;
}
