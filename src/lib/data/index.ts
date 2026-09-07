/**
 * Public data API. Pages import from `@/lib/data` only; the module files
 * (`properties`, `leases`, `lease-specs`, `critical-dates`, `obligations`,
 * `content`, `engagement`, `audit`) are internal organization.
 */
export { portfolios, properties, portfolioName, propertyById } from './properties';
export { leases, leaseById, leasesByProperty, occupancyByProperty } from './leases';
export { criticalDates, criticalDatesForLease } from './critical-dates';
export { obligations, obligationsForLease } from './obligations';
export { documents, documentsForLease, clausesForLease } from './content';
export { occupancyHistory, rentScheduleForLease } from './content';
export { notes, notesForLease, activityEvents } from './engagement';
export {
  auditEntries,
  platformUsers,
  workspaceSettings,
  NOTIFICATION_RULE_OPTIONS,
  RETENTION_TEMPLATE_LABEL,
} from './audit';
