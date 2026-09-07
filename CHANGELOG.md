# Changelog

All notable changes to LeaseVault Commercial are documented here.
Dates follow the internal release calendar; format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] — 2026-09-07

### Added

- **Audit log** (`/audit-log`): immutable chronological record of every system action — sign-ins, abstract changes, document events, role changes, exports — with filters by user, action type, and a "record changes only" view for audit sampling.
- **User management** (`/users`): seat table with roles (Admin, Property Manager, Read-Only), statuses (Active, Invited, Suspended), a validated invite modal, and the full permission matrix.
- **Settings expansion**: document retention policies per document class (3–10 years or permanent), append-only audit trail control, SSO/MFA enforcement display, and portfolio defaults.
- **Multi-step lease abstract wizard**: Parties → Term & rent → Dates & options → Review, with per-step validation and SSM/company registration number format checks (legacy `123456-A`, 12-digit, and combined formats).
- **Document upload hardening**: PDF-only enforcement, 10 MB ceiling, drag-and-drop intake, and automatic version increment (`1.0` → `2.0`).
- **Critical date entry validation**: past due dates rejected for future obligations; option notice deadlines must precede expiration.
- **Micro-interactions**: hover-revealed row quick actions (Open / CSV), sort-change row animation with staggered entry, urgency pulse on red-window (< 30 day) critical dates, skeleton placeholders while lease tabs switch, and list↔detail page transitions via `template.tsx`.
- **Accessibility**: every animation honors `prefers-reduced-motion` (pulses become static rings, transitions collapse).

## [0.2.0] — 2026-08-21

### Added

- **Lease management**: 15 hand-specified commercial abstracts across 4 properties (office, flex, medical office, retail) with permitted use, PM contacts, and realistic tenants.
- **Critical dates calendar** (`/calendar`): month grid with category-colored event dots (Expiration, Escalation, Notice, Renewal), property/event-type filters, day detail panel, and RFC 5545 iCal export.
- **Financial obligations** (`/financials`): portfolio obligation ledger with Tax Escrow support, overdue highlighting, and monthly/upcoming/overdue summary cards.
- **Lease detail**: five tabs (Overview, Critical Dates, Financial Obligations, Documents, Notes), escalation rent schedules, renewal option tables, threaded notes, and a sticky quick-facts sidebar.
- **Dashboard** (`/dashboard`): KPI row, 13-month occupancy trend chart, critical-dates-this-month timeline, and activity feed.
- **Lease list**: filter sidebar (status, property, rent range), bulk selection with CSV export, and days-remaining countdowns.

## [0.1.0] — 2026-08-05

### Added

- **Foundation**: Next.js 14 App Router scaffold with TypeScript strict mode, Tailwind CSS, ESLint, and Prettier.
- **Design system**: navy/teal/slate palette, IBM Plex Sans & Mono typography, and a conservative financial-sector aesthetic.
- **Component library**: Button (primary/secondary/outline/destructive), DataTable (sorting, filtering, pagination), Badge, Timeline, Date/Range pickers, Tabs, Tooltip, focus-trapped Modal, StatCard, Skeletons, and EmptyState.
- **Navigation shell**: command bar with global search (⌘K), portfolio selector, left sidebar with live badge counts, and SOC 2 footer.
- **Data architecture**: seeded deterministic fixtures behind a single `src/lib/data` seam, ISO date utilities, and a reusable SEO metadata template.
