# LeaseVault Commercial

Lease administration platform for commercial property managers and corporate real estate teams. Digitizes commercial lease agreements, tracks critical dates, and manages financial obligations across the portfolio.

## Overview

LeaseVault turns static lease PDFs into structured, queryable abstracts. Landlords and asset managers get a single workspace for the entire lease lifecycle:

- **Abstracts** — key terms, escalation ladders, renewal options, and permitted use per lease
- **Critical dates** — expiration, renewal-option notices, escalations, CAM reconciliation, and COI renewals with 30/90-day urgency windows
- **Financial obligations** — Base Rent, CAM, tax escrow, insurance, and percentage rent with overdue detection
- **Documents vault** — versioned, PDF-only storage with retention policies
- **Audit trail** — append-only record of every sign-in and record change

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript strict |
| Styling | Tailwind CSS — navy `#1A2B4A` / teal `#0D7377` palette, IBM Plex Sans & Mono |
| Quality | ESLint (`next/core-web-vitals`), Prettier, `tsc --noEmit` in CI |
| Data | Deterministic seeded fixtures behind a single `src/lib/data` seam, ready for API swap |

## Data security approach

- **Transport & storage** — TLS 1.3 in transit; AES-256 encryption at rest for documents and database backups.
- **Identity** — SSO (SAML 2.0 / Okta) with mandatory MFA; sessions expire after 30 idle minutes.
- **Access control** — three roles (Admin, Property Manager, Read-Only) enforced at the route and component level; the capability matrix lives on `/users`.
- **Audit trail** — append-only audit log (sign-ins, abstract changes, document events, role changes, exports) with 7-year retention; no role, including Admin, can edit or delete entries.
- **Uploads** — PDF-only enforcement, 10 MB ceiling, virus scanning, and watermarked retrieval.
- **Retention** — configurable per document class (3–10 years post-termination or permanent); legal holds override deletion.

## Audit readiness

- Every record change captures actor, timestamp, action type, affected record, and detail.
- Read-audit and mutating actions are separately filterable for SOC 2 sampling.
- Retention and immutability toggles are themselves audited settings changes.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check (CI) |

## Project structure

```
src/
  app/                    # App Router pages (server components by default)
    dashboard/            # KPIs, occupancy trend, activity feed
    leases/               # List + [leaseId] detail (5 tabs, quick facts)
    calendar/             # Critical dates grid + iCal export
    financials/           # Obligation ledger
    documents/            # Versioned vault
    reports/              # Standard reporting package
    audit-log/            # Immutable system record
    users/                # Seats, roles, permission matrix
    settings/             # Portfolio, notifications, retention, security
  components/
    ui/                   # DataTable (sort/filter/paginate/select), Tabs, Modal, …
    layout/               # CommandBar, Sidebar, AppShell, wizard button
    charts/ · notes/ · documents/ · users/
  lib/                    # types, seeded data, dates, validation, csv/ical, seo
```

## Component library (`src/components/ui`)

Button, DataTable (sort/filter/pagination/bulk selection/hover quick actions), Badge + LeaseStatusBadge, Timeline, DatePicker & DateRangePicker, Tabs (with switch skeletons), Tooltip, Modal (focus-trapped), StatCard, Skeleton family, EmptyState — all animation respects `prefers-reduced-motion`.

## Data layer

Pages read exclusively through `src/lib/data.ts`. The dataset is seeded and deterministic; swap the exported helpers for API calls when the backend lands. Form logic uses pure validators from `src/lib/validation.ts` (SSM registration format, lease date logic, upload constraints).
