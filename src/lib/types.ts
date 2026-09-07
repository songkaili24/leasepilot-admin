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
  | 'Tax Escrow'
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

export interface Contact {
  name: string;
  phone: string;
  email: string;
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
  yearBuilt: number;
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
  propertyManagerContact: Contact;
  permittedUse: string;
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

/** Threaded note on a lease record. Replies reference their parent via `parentId`. */
export interface LeaseNote {
  id: string;
  leaseId: string;
  author: string;
  authorRole: string;
  /** ISO datetime. */
  createdAt: string;
  body: string;
  parentId: string | null;
}

export type ActivityKind = 'Amendment' | 'Document' | 'Status' | 'Payment' | 'Deadline';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  leaseId: string;
  summary: string;
  actor: string;
  /** ISO datetime. */
  at: string;
}

/** Portfolio-level occupancy for one month; `month` is `YYYY-MM`. */
export interface OccupancyPoint {
  month: string;
  occupancy: number;
}

export interface RentScheduleRow {
  leaseYear: number;
  periodStart: string;
  periodEnd: string;
  monthlyRent: number;
  annualRent: number;
  /** Escalation applied at the start of this lease year (0 for year 1). */
  escalationPct: number;
}

export interface LeaseStatusCount {
  status: LeaseStatus;
  count: number;
}

export type PlatformRole = 'Admin' | 'Property Manager' | 'Read-Only';

export type AuditActionType =
  | 'Sign-in'
  | 'Sign-out'
  | 'Lease created'
  | 'Lease updated'
  | 'Status change'
  | 'Document upload'
  | 'Document delete'
  | 'Note added'
  | 'User invited'
  | 'Role change'
  | 'Settings change'
  | 'Export';

/** Immutable audit entry: who did what to which record, and when. */
export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: AuditActionType;
  record: string;
  recordHref?: string;
  detail: string;
  source: 'web' | 'api';
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  lastActiveAt: string | null;
  status: 'Active' | 'Invited' | 'Suspended';
}

/** Permission matrix row: what each platform role may do. */
export interface PermissionMatrixRow {
  capability: string;
  description: string;
  admin: boolean;
  propertyManager: boolean;
  readOnly: boolean;
}
