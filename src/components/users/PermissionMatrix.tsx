import { Badge } from '@/components/ui/Badge';
import type { PlatformRole } from '@/lib/types';

const MATRIX_ROWS: Array<{
  capability: string;
  description: string;
  admin: boolean | 'limited';
  propertyManager: boolean | 'limited';
  readOnly: boolean | 'limited';
}> = [
  {
    capability: 'View lease abstracts',
    description: 'Read access to full abstracts, schedules, and documents',
    admin: true,
    propertyManager: true,
    readOnly: true,
  },
  {
    capability: 'Create & edit abstracts',
    description: 'Intake wizard, corrections, and status management',
    admin: true,
    propertyManager: true,
    readOnly: false,
  },
  {
    capability: 'Upload documents',
    description: 'Versioned vault uploads (PDF-only enforced)',
    admin: true,
    propertyManager: true,
    readOnly: false,
  },
  {
    capability: 'Record notes',
    description: 'Threaded negotiation and compliance notes',
    admin: true,
    propertyManager: true,
    readOnly: false,
  },
  {
    capability: 'Export data',
    description: 'CSV / PDF exports and report generation',
    admin: true,
    propertyManager: 'limited',
    readOnly: false,
  },
  {
    capability: 'Manage critical dates',
    description: 'Add or re-date contractual deadlines',
    admin: true,
    propertyManager: 'limited',
    readOnly: false,
  },
  {
    capability: 'View audit log',
    description: 'Read-only access to the immutable system record',
    admin: true,
    propertyManager: true,
    readOnly: false,
  },
  {
    capability: 'Manage users & roles',
    description: 'Invitations, suspensions, and role assignment',
    admin: true,
    propertyManager: false,
    readOnly: false,
  },
  {
    capability: 'Configure portfolio & retention',
    description: 'Workspace defaults, notification rules, retention',
    admin: true,
    propertyManager: false,
    readOnly: false,
  },
];

function Cell({ value }: { value: boolean | 'limited' }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700">
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-xs font-bold"
        >
          ✓
        </span>
        <span className="sr-only">Allowed</span>
      </span>
    );
  }
  if (value === 'limited') {
    return <Badge tone="amber">Limited</Badge>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
      <span aria-hidden>—</span>
      <span className="sr-only">Not permitted</span>
    </span>
  );
}

/** Role capability matrix for the Users page. */
export function PermissionMatrix() {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">Role permission matrix</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th scope="col" className="px-4 py-2.5">
              Capability
            </th>
            <th scope="col" className="px-4 py-2.5 text-center">
              Admin
            </th>
            <th scope="col" className="px-4 py-2.5 text-center">
              Property Manager
            </th>
            <th scope="col" className="px-4 py-2.5 text-center">
              Read-Only
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MATRIX_ROWS.map((row) => (
            <tr key={row.capability} className="transition-colors hover:bg-slate-50">
              <td className="px-4 py-2.5">
                <p className="font-medium text-navy-900">{row.capability}</p>
                <p className="text-xs text-slate-500">{row.description}</p>
              </td>
              <td className="px-4 py-2.5 text-center">
                <Cell value={row.admin} />
              </td>
              <td className="px-4 py-2.5 text-center">
                <Cell value={row.propertyManager} />
              </td>
              <td className="px-4 py-2.5 text-center">
                <Cell value={row.readOnly} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
