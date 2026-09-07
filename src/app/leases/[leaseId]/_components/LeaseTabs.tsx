import type { ReactNode } from 'react';
import { Tabs } from '@/components/ui';
import type { TabItem } from '@/components/ui/Tabs';
import {
  criticalDatesForLease,
  documentsForLease,
  notesForLease,
  obligationsForLease,
} from '@/lib/data';
import type { Lease } from '@/lib/types';

export interface LeaseTabSpec {
  id: string;
  label: string;
}

interface LeaseTabsProps {
  lease: Lease;
  tabs: LeaseTabSpec[];
  /** Panel content keyed by tab id. */
  panels: Record<string, ReactNode>;
}

/** Builds tab metadata (labels with record counts) and maps ids to panel content. */
export function LeaseTabs({ lease, tabs, panels }: LeaseTabsProps) {
  const counts: Record<string, number> = {
    dates: criticalDatesForLease(lease.id).length,
    financials: obligationsForLease(lease.id).length,
    documents: documentsForLease(lease.id).length,
    notes: notesForLease(lease.id).length,
  };

  const items: TabItem[] = tabs.map((tab) => {
    const content = panels[tab.id];
    if (content === undefined) {
      throw new Error(`LeaseTabs: missing panel for tab "${tab.id}"`);
    }
    return { id: tab.id, label: tab.label, count: counts[tab.id], content };
  });

  return <Tabs items={items} />;
}
