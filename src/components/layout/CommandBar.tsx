'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { PortfolioSelect } from './PortfolioSelect';
import { NewLeaseAbstractButton } from './NewLeaseAbstractButton';
import { Sidebar } from './Sidebar';

export function CommandBar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen(true)}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:hidden"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded bg-navy-800 font-mono text-sm font-bold text-teal-300"
          >
            LV
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold tracking-tight text-navy-900">
              LeaseVault
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Commercial
            </span>
          </span>
        </Link>

        <div className="ml-2 flex flex-1 justify-center">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PortfolioSelect />
          <NewLeaseAbstractButton />
          <div aria-hidden className="hidden h-6 w-px bg-slate-200 md:block" />
          <div className="hidden items-center gap-2.5 md:flex">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white"
            >
              KW
            </span>
            <span className="hidden leading-tight lg:block">
              <span className="block text-xs font-semibold text-navy-900">Kelly Warren</span>
              <span className="block text-[11px] text-slate-500">Portfolio Administrator</span>
            </span>
          </div>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden
            className="absolute inset-0 animate-fade-in bg-navy-950/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-slide-in-left flex-col bg-white shadow-xl"
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-sm font-semibold text-navy-900">Navigation</span>
              <button
                type="button"
                aria-label="Close navigation"
                autoFocus
                onClick={() => setMobileNavOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
