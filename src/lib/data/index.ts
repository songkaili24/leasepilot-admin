/**
 * Public data API. Pages import from `@/lib/data` only; the module files
 * (`properties`, `leases`, `lease-specs`, `critical-dates`, `obligations`,
 * `content`, `engagement`) are internal organization.
 */
export { portfolios, properties, portfolioName, propertyById } from './properties';
export { leases, leaseById, leasesByProperty, occupancyByProperty } from './leases';
export { criticalDates, criticalDatesForLease } from './critical-dates';
export { obligations, obligationsForLease } from './obligations';
export { documents, documentsForLease, clausesForLease } from './content';
export { occupancyHistory, rentScheduleForLease } from './content';
export { notes, notesForLease, activityEvents } from './engagement';
