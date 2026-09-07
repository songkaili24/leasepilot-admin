'use client';

import { NotesThread } from '@/components/notes/NotesThread';
import { notesForLease } from '@/lib/data';
import type { Lease } from '@/lib/types';

/** Notes tab: threaded lease notes with reply composition. */
export function LeaseNotesTab({ lease }: { lease: Lease }) {
  return <NotesThread notes={notesForLease(lease.id)} />;
}
