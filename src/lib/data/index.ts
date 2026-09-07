/**
 * Public data API. Pages import from `@/lib/data` only; the module files
 * (`properties`, `leases`, `records`) are internal organization.
 */
export { portfolios, properties, portfolioName, propertyById } from './properties';
export { leases, leaseById, leasesByProperty, occupancyByProperty } from './leases';
export {
  criticalDates,
  criticalDatesForLease,
  obligations,
  obligationsForLease,
  documents,
  documentsForLease,
  clausesForLease,
} from './records';
