import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { AuditActionType } from '@/lib/types';

/** Audit action → badge tone mapping for the audit log table. */
export const auditActionTone: Record<AuditActionType, BadgeTone> = {
  'Sign-in': 'slate',
  'Sign-out': 'slate',
  'Lease created': 'teal',
  'Lease updated': 'navy',
  'Status change': 'amber',
  'Document upload': 'teal',
  'Document delete': 'red',
  'Note added': 'navy',
  'User invited': 'teal',
  'Role change': 'amber',
  'Settings change': 'amber',
  Export: 'slate',
};

/** Mutating actions that demand strict audit capture (audit-readiness copy). */
export const MUTATING_ACTIONS: AuditActionType[] = [
  'Lease created',
  'Lease updated',
  'Status change',
  'Document upload',
  'Document delete',
  'Note added',
  'User invited',
  'Role change',
  'Settings change',
];
