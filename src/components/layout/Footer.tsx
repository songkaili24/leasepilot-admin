'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { APP_VERSION, SITE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {SITE_NAME} ·{' '}
          <span className="font-mono tabular-nums">v{APP_VERSION}</span>
        </p>
        <p>
          Support:{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-navy-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {SUPPORT_EMAIL}
          </a>{' '}
          · <span className="font-mono tabular-nums">{SUPPORT_PHONE}</span>
        </p>
        <p className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-medium text-teal-800">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
          SOC 2 Type II Certified
        </p>
      </div>
    </footer>
  );
}
