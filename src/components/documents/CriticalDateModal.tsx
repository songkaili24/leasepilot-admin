'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { leaseDateErrors, futureObligationDateError, type FieldError } from '@/lib/validation';

const inputClasses =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700';
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1';

/**
 * Critical date entry: validates future-obligation due dates (no past dates)
 * and cross-field logic — notice deadlines must precede expiration.
 */
export function CriticalDateModal({
  open,
  onClose,
  leaseNumber,
  expirationDate,
}: {
  open: boolean;
  onClose: () => void;
  leaseNumber: string;
  expirationDate: string;
}) {
  const [type, setType] = useState('Renewal Option');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [noticeDate, setNoticeDate] = useState<string | null>(null);
  const [isFutureObligation, setIsFutureObligation] = useState(true);
  const [errors, setErrors] = useState<FieldError[]>([]);

  function close() {
    onClose();
    window.setTimeout(() => {
      setType('Renewal Option');
      setDueDate(null);
      setNoticeDate(null);
      setIsFutureObligation(true);
      setErrors([]);
    }, 150);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: FieldError[] = [];
    const dueError = futureObligationDateError(dueDate, isFutureObligation);
    if (dueError) next.push({ field: 'dueDate', message: dueError });
    if (dueDate && dueDate >= expirationDate) {
      next.push({ field: 'dueDate', message: 'Date must fall before lease expiration' });
    }
    const logic = leaseDateErrors({
      commencementDate: null,
      expirationDate,
      noticeDeadline: noticeDate,
    }).filter((e) => e.field === 'noticeDeadline');
    next.push(...logic);
    setErrors(next);
    if (next.length === 0) close();
  }

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add critical date"
      description={`${leaseNumber} · expiration ${expirationDate}`}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="critical-date-form">
            Add to calendar
          </Button>
        </>
      }
    >
      <form id="critical-date-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="cd-type" className={labelClasses}>
            Event type
          </label>
          <select
            id="cd-type"
            className={inputClasses}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {[
              'Renewal Option',
              'Rent Escalation',
              'CAM Reconciliation',
              'Insurance Certificate',
              'Estoppel Certificate',
              'Expiration',
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cd-due" className={labelClasses}>
            Due date
          </label>
          <DatePicker value={dueDate} onChange={setDueDate} ariaLabel="Critical date due date" />
          {errorFor('dueDate') ? (
            <p role="alert" className="mt-1 text-xs font-medium text-red-700">
              {errorFor('dueDate')}
            </p>
          ) : null}
        </div>
        {type === 'Renewal Option' ? (
          <div>
            <label className={labelClasses}>Option notice deadline</label>
            <DatePicker
              value={noticeDate}
              onChange={setNoticeDate}
              ariaLabel="Option notice deadline"
            />
            {errorFor('noticeDeadline') ? (
              <p role="alert" className="mt-1 text-xs font-medium text-red-700">
                {errorFor('noticeDeadline')}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Must precede expiration — the notice window per the option clause.
              </p>
            )}
          </div>
        ) : null}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-900">
          <input
            type="checkbox"
            checked={isFutureObligation}
            onChange={(e) => setIsFutureObligation(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-teal-700"
          />
          Future obligation (reject past due dates)
        </label>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Badge tone="amber">Validated against lease term</Badge>
          <Badge tone="teal">Reminder rules apply on save</Badge>
        </div>
      </form>
    </Modal>
  );
}
