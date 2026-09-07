'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WizardStepBody } from './abstract-wizard/WizardStepBody';
import { INITIAL_WIZARD, STEPS, validateStep } from './abstract-wizard/wizard-config';
import type { FieldError } from '@/lib/validation';
import type { WizardState } from './abstract-wizard/wizard-config';

/**
 * Multi-step "New Lease Abstract" intake wizard: Parties → Term & rent →
 * Dates & options → Review, with validation gating each step. Panel content
 * and step validation live in `abstract-wizard/`.
 */
export function AbstractWizardButton({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<WizardState>(INITIAL_WIZARD);
  const [errors, setErrors] = useState<FieldError[]>([]);

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  function close() {
    setOpen(false);
    window.setTimeout(() => {
      setStep(0);
      setSubmitted(false);
      setForm(INITIAL_WIZARD);
      setErrors([]);
    }, 150);
  }

  function goNext() {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (stepErrors.length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Plus aria-hidden className="h-4 w-4" />
        <span className="hidden sm:inline">New Lease Abstract</span>
        <span className="sm:hidden">Abstract</span>
      </Button>
      <Modal
        open={open}
        onClose={close}
        size="lg"
        title={submitted ? 'Abstract intake created' : 'New Lease Abstract'}
        description={
          submitted ? undefined : `Step ${step + 1} of ${STEPS.length} — ${STEPS[step].label}`
        }
        footer={
          submitted ? (
            <Button onClick={close}>Close</Button>
          ) : (
            <>
              {step > 0 ? (
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button onClick={goNext}>
                  Continue
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setSubmitted(true)}>
                  <Check aria-hidden className="h-4 w-4" />
                  Create abstract
                </Button>
              )}
            </>
          )
        }
      >
        {submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-teal-800">
              Abstract intake created for {form.tenantName.trim()}.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Lease number and the full abstract record will be generated during review.
            </p>
          </div>
        ) : (
          <WizardStepBody
            step={step}
            form={form}
            errorFor={errorFor}
            onPatch={(patch) => setForm((f) => ({ ...f, ...patch }))}
          />
        )}
      </Modal>
    </>
  );
}
