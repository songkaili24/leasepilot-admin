import { addDays } from '../dates';
import type { AuditActionType, AuditEntry, PlatformRole, PlatformUser } from '../types';
import { isoDate, rngFor } from './internal';
import { leases } from './leases';
import { pmNames } from './lease-specs';

const TODAY = isoDate(new Date());
const day = (n: number) => addDays(TODAY, n);

/* ------------------------------------------------------------------ */
/* Platform users                                                      */
/* ------------------------------------------------------------------ */

export const platformUsers: PlatformUser[] = [
  {
    id: 'u-1',
    name: 'Kelly Warren',
    email: 'k.warren@leasevault.com',
    role: 'Admin',
    lastActiveAt: `${TODAY}T08:41:00`,
    status: 'Active',
  },
  {
    id: 'u-2',
    name: 'Dana Okafor',
    email: 'd.okafor@leasevault.com',
    role: 'Property Manager',
    lastActiveAt: `${day(-1)}T16:12:00`,
    status: 'Active',
  },
  {
    id: 'u-3',
    name: 'Sara Whitfield',
    email: 's.whitfield@leasevault.com',
    role: 'Property Manager',
    lastActiveAt: `${day(-2)}T11:03:00`,
    status: 'Active',
  },
  {
    id: 'u-4',
    name: 'Mio Tanaka',
    email: 'm.tanaka@leasevault.com',
    role: 'Property Manager',
    lastActiveAt: `${day(-4)}T09:27:00`,
    status: 'Active',
  },
  {
    id: 'u-5',
    name: 'Rafael Gutierrez',
    email: 'r.gutierrez@leasevault.com',
    role: 'Property Manager',
    lastActiveAt: `${day(-3)}T14:48:00`,
    status: 'Active',
  },
  {
    id: 'u-6',
    name: 'Priya Raghavan',
    email: 'p.raghavan@leasevault.com',
    role: 'Read-Only',
    lastActiveAt: `${day(-6)}T10:15:00`,
    status: 'Active',
  },
  {
    id: 'u-7',
    name: 'External Auditor (KPMG)',
    email: 'audit@kpmg-example.com',
    role: 'Read-Only',
    lastActiveAt: null,
    status: 'Invited',
  },
  {
    id: 'u-8',
    name: 'Tom Boone',
    email: 't.boone@leasevault.com',
    role: 'Property Manager',
    lastActiveAt: `${day(-45)}T17:30:00`,
    status: 'Suspended',
  },
];

/* ------------------------------------------------------------------ */
/* Audit log — chronological system record                             */
/* ------------------------------------------------------------------ */

const ACTION_TEMPLATES: Array<{
  action: AuditActionType;
  detail: (leaseNumber: string) => string;
}> = [
  { action: 'Lease created', detail: (l) => `Lease abstract ${l} created from intake wizard` },
  { action: 'Lease updated', detail: (l) => `Base rent and escalation schedule corrected on ${l}` },
  {
    action: 'Status change',
    detail: (l) => `Status moved to Expiring — term inside 90-day window (${l})`,
  },
  { action: 'Document upload', detail: (l) => `Amendment No. 1 uploaded and versioned for ${l}` },
  { action: 'Note added', detail: (l) => `Negotiation note posted on ${l}` },
  { action: 'Export', detail: (l) => `Lease record exported to PDF (${l})` },
];

const SETTINGS_DETAILS: Array<{ record: string; detail: string }> = [
  {
    record: 'Retention policy',
    detail: 'Document retention window changed from 7 to 10 years post-termination',
  },
  { record: 'Notification rules', detail: 'Default critical-date reminder window set to 90 days' },
  { record: 'Audit logging', detail: 'Immutable audit trail retention extended to 7 years' },
  { record: 'Portfolio defaults', detail: 'Default fiscal year start changed to July' },
];

const USER_ACTIONS: Array<{ action: AuditActionType; detail: (name: string) => string }> = [
  {
    action: 'User invited',
    detail: (name) => `Invitation sent to ${name} with Property Manager role`,
  },
  { action: 'Role change', detail: (name) => `Role for ${name} changed to Read-Only` },
];

function makeAuditEntries(): AuditEntry[] {
  const entries: AuditEntry[] = [];
  let seq = 0;
  const rng = rngFor('audit-log');

  // Sign-ins for every active user across the trailing 14 days.
  for (const name of pmNames) {
    const signIns = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < signIns; i++) {
      const at = day(-Math.floor(rng() * 14));
      entries.push({
        id: `aud-${seq++}`,
        at: `${at}T0${7 + Math.floor(rng() * 2)}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00`,
        actor: name,
        action: 'Sign-in',
        record: name,
        detail: 'Signed in with SSO (Okta); MFA satisfied',
        source: 'web',
      });
    }
  }

  // Lease-scoped actions.
  for (const lease of leases) {
    const count = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const template = ACTION_TEMPLATES[(seq + i) % ACTION_TEMPLATES.length];
      const at = day(-Math.floor(rng() * 30));
      entries.push({
        id: `aud-${seq++}`,
        at: `${at}T${String(9 + Math.floor(rng() * 8)).padStart(2, '0')}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00`,
        actor: lease.propertyManager,
        action: template.action,
        record: lease.leaseNumber,
        recordHref: `/leases/${lease.id}`,
        detail: template.detail(lease.leaseNumber),
        source: 'web',
      });
    }
  }

  // Administrative actions.
  for (const item of SETTINGS_DETAILS) {
    const at = day(-Math.floor(rng() * 21));
    entries.push({
      id: `aud-${seq++}`,
      at: `${at}T${String(10 + Math.floor(rng() * 6)).padStart(2, '0')}:05:00`,
      actor: 'Kelly Warren',
      action: 'Settings change',
      record: item.record,
      detail: item.detail,
      source: 'web',
    });
  }

  const invited = platformUsers.filter((u) => u.status === 'Invited');
  for (const user of invited) {
    const at = day(-Math.floor(rng() * 10));
    entries.push({
      id: `aud-${seq++}`,
      at: `${at}T11:${String(10 + Math.floor(rng() * 40)).padStart(2, '0')}:00`,
      actor: 'Kelly Warren',
      action: 'User invited',
      record: user.name,
      detail: `Invitation sent to ${user.email} with ${user.role} role`,
      source: 'web',
    });
  }

  const suspended = platformUsers.filter((u) => u.status === 'Suspended');
  for (const user of suspended) {
    const at = day(-Math.floor(rng() * 60));
    entries.push({
      id: `aud-${seq++}`,
      at: `${at}T15:${String(10 + Math.floor(rng() * 40)).padStart(2, '0')}:00`,
      actor: 'Kelly Warren',
      action: 'Role change',
      record: user.name,
      detail: `Account suspended after 45 days of inactivity`,
      source: 'web',
    });
  }

  // Document deletions are rare but audit-critical.
  entries.push({
    id: `aud-${seq++}`,
    at: `${day(-9)}T12:22:00`,
    actor: 'Sara Whitfield',
    action: 'Document delete',
    record: 'LV-2023-0544',
    recordHref: '/leases/l-13',
    detail: 'Duplicate COI upload removed; original version 2.0 retained',
    source: 'web',
  });

  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

export const auditEntries: AuditEntry[] = makeAuditEntries();

/* ------------------------------------------------------------------ */
/* Workspace settings (retention, notifications, portfolio defaults)    */
/* ------------------------------------------------------------------ */

export interface WorkspaceSettings {
  orgName: string;
  defaultPortfolioId: string;
  fiscalYearStartMonth: number;
  criticalDateReminderDays: number;
  escalationNoticeDays: number;
  documentRetentionYears: number;
  auditLogRetentionYears: number;
  auditLogImmutable: boolean;
  requireSsoForAllUsers: boolean;
  sessionTimeoutMinutes: number;
  enforcePdfOnlyUploads: boolean;
  maxUploadSizeMb: number;
}

export const workspaceSettings: WorkspaceSettings = {
  orgName: 'LeaseVault Commercial',
  defaultPortfolioId: 'all',
  fiscalYearStartMonth: 1,
  criticalDateReminderDays: 90,
  escalationNoticeDays: 30,
  documentRetentionYears: 10,
  auditLogRetentionYears: 7,
  auditLogImmutable: true,
  requireSsoForAllUsers: true,
  sessionTimeoutMinutes: 30,
  enforcePdfOnlyUploads: true,
  maxUploadSizeMb: 10,
};

/** Landlord-side obligation events that auto-generate reminder rules. */
export const NOTIFICATION_RULE_OPTIONS: Array<{ id: string; label: string; description: string }> =
  [
    {
      id: 'expiration',
      label: 'Lease expiration',
      description: 'Primary term end; drives renewal or holdover posture.',
    },
    {
      id: 'renewal-option',
      label: 'Renewal option notice',
      description: 'Tenant exercise windows per the option clause.',
    },
    {
      id: 'rent-escalation',
      label: 'Rent escalation',
      description: 'Annual Base Rent adjustments on lease anniversaries.',
    },
    {
      id: 'cam-reconciliation',
      label: 'CAM reconciliation',
      description: 'Annual operating-expense true-up cycle.',
    },
    {
      id: 'insurance-certificate',
      label: 'Insurance certificate',
      description: 'COI renewals evidencing required CGL limits.',
    },
    {
      id: 'estoppel',
      label: 'Estoppel certificates',
      description: 'Lender or purchaser estoppel campaigns.',
    },
  ];

export const RETENTION_TEMPLATE_LABEL = `Documents retained ${workspaceSettings.documentRetentionYears} years after termination per policy; legal holds override deletion.`;
