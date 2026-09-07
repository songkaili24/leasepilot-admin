# LeaseVault Commercial

Lease administration platform for commercial property managers and corporate real estate teams. Digitizes commercial lease agreements, tracks critical dates, and manages financial obligations.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript strict
- Tailwind CSS with custom navy / teal / slate palette
- IBM Plex Sans (body) · IBM Plex Mono (lease numbers & figures)
- ESLint (next/core-web-vitals + prettier) · Prettier

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script                | Purpose                          |
| --------------------- | -------------------------------- |
| `npm run dev`         | Start the development server     |
| `npm run build`       | Production build                 |
| `npm run start`       | Serve the production build       |
| `npm run lint`        | ESLint                           |
| `npm run typecheck`   | `tsc --noEmit` (strict)          |
| `npm run format`      | Prettier write                   |
| `npm run format:check`| Prettier check (CI)              |

## Project structure

```
src/
  app/                    # App Router pages (server components by default)
    _components/          #   dashboard view
    leases/               #   all leases + [leaseId] detail
    calendar/             #   critical dates calendar
    financials/           #   financial obligations
    documents/            #   documents vault
    reports/              #   reports & exports
    settings/             #   workspace settings
    properties/           #   property detail ([propertyId])
  components/
    ui/                   # reusable component library
    layout/               # AppShell, CommandBar, Sidebar, Footer
  lib/                    # types, seeded mock data, dates, format, alerts, seo
```

## Component library (`src/components/ui`)

Button (primary/secondary/outline/destructive), DataTable (sort/filter/pagination/mobile cards), Badge + LeaseStatusBadge, Timeline, DatePicker & DateRangePicker, Tabs, Tooltip, Modal (focus-trapped), StatCard, Skeleton/EmptyState.

## Data layer

Pages read exclusively through `src/lib/data.ts` and `src/lib/search.ts`. The dataset is seeded and deterministic (`src/lib/seed.ts`); swap the exported helpers for API calls when the backend lands.
