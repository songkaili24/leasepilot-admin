'use client';

import { useState } from 'react';
import { Check, FileClock, Landmark, ScrollText, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { portfolios } from '@/lib/data';
import { RETENTION_TEMPLATE_LABEL } from '@/lib/data';

const inputClasses =
  'h-9 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';
const cardClasses = 'rounded-md border border-slate-200 bg-white p-4 shadow-sm';
const cardHeading = 'text-sm font-semibold text-navy-900';

const NOTIFICATION_RULES = [
  { id: 'critical-30', label: 'Critical date reminders (30-day window)', defaultChecked: true },
  {
    id: 'critical-90',
    label: 'Critical date planning notices (90-day window)',
    defaultChecked: true,
  },
  { id: 'obligation-overdue', label: 'Overdue payment alerts', defaultChecked: true },
  {
    id: 'abstract-updated',
    label: 'Abstract change notifications (leases I follow)',
    defaultChecked: false,
  },
  { id: 'weekly-digest', label: 'Weekly portfolio digest (Monday 7:00 AM)', defaultChecked: true },
];

const RETENTION_RULES = [
  { id: 'lease-agreements', label: 'Lease agreements & amendments', defaultYears: 10 },
  { id: 'correspondence', label: 'Correspondence & notices', defaultYears: 3 },
  { id: 'coi', label: 'Certificates of insurance', defaultYears: 5 },
  { id: 'financial', label: 'Reconciliation & billing records', defaultYears: 7 },
];

const SECTION_ICON = 'mt-0.5 h-4 w-4 shrink-0 text-slate-400';

export function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [auditImmutable, setAuditImmutable] = useState(true);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Portfolio configuration, notification rules, document retention, and audit controls. Changes apply immediately and are recorded in the audit log."
      />

      <form onSubmit={handleSave} className="space-y-4">
        <section aria-labelledby="workspace-heading" className={cardClasses}>
          <h2 id="workspace-heading" className={`flex items-center gap-2 ${cardHeading}`}>
            <Landmark aria-hidden className={SECTION_ICON} />
            Portfolio configuration
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="org-name" className={labelClasses}>
                Organization name
              </label>
              <input id="org-name" defaultValue="LeaseVault Commercial" className={inputClasses} />
            </div>
            <div>
              <label htmlFor="default-portfolio" className={labelClasses}>
                Default portfolio
              </label>
              <select id="default-portfolio" className={inputClasses} defaultValue="all">
                <option value="all">All portfolios</option>
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="fiscal-start" className={labelClasses}>
                Fiscal year start
              </label>
              <select id="fiscal-start" className={inputClasses} defaultValue="1">
                <option value="1">January</option>
                <option value="4">April</option>
                <option value="7">July</option>
                <option value="10">October</option>
              </select>
            </div>
          </div>
        </section>

        <section aria-labelledby="alerts-heading" className={cardClasses}>
          <h2 id="alerts-heading" className={`flex items-center gap-2 ${cardHeading}`}>
            <ScrollText aria-hidden className={SECTION_ICON} />
            Default notification rules
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Red window: deadlines due within 30 days or overdue. Amber window: 90 days.
          </p>
          <ul role="list" className="mt-3 space-y-2.5">
            {NOTIFICATION_RULES.map((rule) => (
              <li key={rule.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-900">
                  <input
                    type="checkbox"
                    defaultChecked={rule.defaultChecked}
                    className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                  />
                  {rule.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="retention-heading" className={cardClasses}>
          <h2 id="retention-heading" className={`flex items-center gap-2 ${cardHeading}`}>
            <FileClock aria-hidden className={SECTION_ICON} />
            Document retention policies
          </h2>
          <p className="mt-1 text-sm text-slate-500">{RETENTION_TEMPLATE_LABEL}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RETENTION_RULES.map((rule) => (
              <div key={rule.id}>
                <label htmlFor={`retention-${rule.id}`} className={labelClasses}>
                  {rule.label}
                </label>
                <select
                  id={`retention-${rule.id}`}
                  className={`${inputClasses} max-w-none`}
                  defaultValue={String(rule.defaultYears)}
                >
                  <option value="3">3 years after termination</option>
                  <option value="5">5 years after termination</option>
                  <option value="7">7 years after termination</option>
                  <option value="10">10 years after termination</option>
                  <option value="0">Retain permanently</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="security-heading" className={cardClasses}>
          <h2 id="security-heading" className={`flex items-center gap-2 ${cardHeading}`}>
            <ShieldCheck aria-hidden className={SECTION_ICON} />
            Security &amp; audit controls
          </h2>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-900">
              <input
                type="checkbox"
                checked={auditImmutable}
                onChange={(e) => setAuditImmutable(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-teal-700"
              />
              <span>
                Append-only audit trail
                <span className="block text-xs font-normal text-slate-500">
                  Entries cannot be edited or deleted by any role, including Admins.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-900">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-teal-700"
              />
              <span>
                Require SSO with MFA for all users
                <span className="block text-xs font-normal text-slate-500">
                  Okta SAML 2.0 with TOTP second factor; sessions expire after 30 minutes idle.
                </span>
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Badge tone="teal" dot>
                Encryption at rest (AES-256)
              </Badge>
              <Badge tone="teal" dot>
                TLS 1.3 in transit
              </Badge>
              <Badge tone="navy" dot>
                SOC 2 Type II
              </Badge>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          {saved ? (
            <span
              aria-live="polite"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal-700"
            >
              <Check aria-hidden className="h-4 w-4" />
              Settings saved
            </span>
          ) : null}
        </div>
      </form>
    </>
  );
}
