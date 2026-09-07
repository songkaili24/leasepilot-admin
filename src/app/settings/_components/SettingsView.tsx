'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { portfolios } from '@/lib/data';

const TEAM = [
  {
    name: 'Kelly Warren',
    email: 'k.warren@leasevault.com',
    role: 'Portfolio Administrator',
    lastActive: 'Active now',
  },
  {
    name: 'Dana Okafor',
    email: 'd.okafor@leasevault.com',
    role: 'Asset Manager',
    lastActive: '2 hours ago',
  },
  {
    name: 'Ravi Patel',
    email: 'r.patel@leasevault.com',
    role: 'Lease Analyst',
    lastActive: 'Yesterday',
  },
  {
    name: 'S. Whitfield',
    email: 's.whitfield@leasevault.com',
    role: 'Read-only Auditor',
    lastActive: '3 days ago',
  },
];

const NOTIFICATIONS = [
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

const inputClasses =
  'h-9 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';
const cardClasses = 'rounded-md border border-slate-200 bg-white p-4 shadow-sm';
const cardHeading = 'text-sm font-semibold text-navy-900';

export function SettingsView() {
  const [saved, setSaved] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace defaults, alert thresholds, and team access. Changes apply immediately to your session."
      />

      <form onSubmit={handleSave} className="space-y-4">
        <section aria-labelledby="workspace-heading" className={cardClasses}>
          <h2 id="workspace-heading" className={cardHeading}>
            Workspace defaults
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
          <h2 id="alerts-heading" className={cardHeading}>
            Alert thresholds &amp; notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Red window: deadlines due within 30 days or overdue. Amber window: 90 days.
          </p>
          <ul role="list" className="mt-3 space-y-2.5">
            {NOTIFICATIONS.map((notification) => (
              <li key={notification.id}>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-900">
                  <input
                    type="checkbox"
                    defaultChecked={notification.defaultChecked}
                    className="h-4 w-4 rounded border-slate-300 text-teal-700 accent-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  />
                  {notification.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="team-heading" className={cardClasses}>
          <h2 id="team-heading" className={cardHeading}>
            Team access
          </h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">Team members with workspace access</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-4 py-2">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-2 text-right">
                    Last active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TEAM.map((member) => (
                  <tr key={member.email}>
                    <td className="px-4 py-2.5 font-medium text-navy-900">{member.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{member.email}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={member.role === 'Portfolio Administrator' ? 'teal' : 'slate'}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-slate-500">
                      {member.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
