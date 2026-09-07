'use client';

import { useState } from 'react';
import { MessageSquare, Reply } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDateTime, timeAgo } from '@/lib/dates';
import type { LeaseNote } from '@/lib/types';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function NoteCard({ note, onReply }: { note: LeaseNote; onReply: (note: LeaseNote) => void }) {
  return (
    <article
      aria-label={`Note from ${note.author}, ${timeAgo(note.createdAt)}`}
      className="rounded-md border border-slate-200 bg-white p-3.5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-semibold text-navy-800"
        >
          {initials(note.author)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-semibold text-navy-900">
              {note.author}
              <span className="ml-1.5 text-xs font-normal text-slate-400">{note.authorRole}</span>
            </p>
            <time
              dateTime={note.createdAt}
              title={formatDateTime(note.createdAt)}
              className="font-mono text-[11px] tabular-nums text-slate-400"
            >
              {timeAgo(note.createdAt)}
            </time>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{note.body}</p>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onReply(note)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <Reply aria-hidden className="h-3 w-3" />
              Reply
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Threaded notes with reply composition. Purely client-side for now. */
export function NotesThread({ notes }: { notes: LeaseNote[] }) {
  const [replyTo, setReplyTo] = useState<LeaseNote | null>(null);
  const [draft, setDraft] = useState('');

  const roots = notes.filter((n) => n.parentId === null);
  const repliesOf = (parentId: string) => notes.filter((n) => n.parentId === parentId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Mock persistence: the API layer will own note creation.
    setDraft('');
    setReplyTo(null);
  }

  return (
    <section aria-label="Lease notes" className="space-y-4">
      {roots.length === 0 ? (
        <p className="text-sm text-slate-500">No notes on this lease yet.</p>
      ) : (
        <ol role="list" className="space-y-4">
          {roots.map((root) => (
            <li key={root.id} className="space-y-2.5">
              <NoteCard note={root} onReply={setReplyTo} />
              {repliesOf(root.id).length > 0 ? (
                <ol
                  role="list"
                  aria-label={`Replies to note from ${root.author}`}
                  className="ml-6 space-y-2.5 border-l-2 border-slate-100 pl-4 sm:ml-10"
                >
                  {repliesOf(root.id).map((reply) => (
                    <li key={reply.id}>
                      <NoteCard note={reply} onReply={setReplyTo} />
                    </li>
                  ))}
                </ol>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-md border border-slate-200 bg-slate-50 p-3.5"
      >
        <label
          htmlFor="note-body"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          <MessageSquare aria-hidden className="h-3.5 w-3.5" />
          {replyTo ? `Reply to ${replyTo.author}` : 'Add note'}
        </label>
        <textarea
          id="note-body"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Document the negotiation, flag a clause risk, or summarize a call…"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700"
        />
        <div className="mt-2.5 flex items-center justify-between gap-3">
          {replyTo ? (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Cancel reply — post as new note
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm" disabled={draft.trim() === ''}>
            {replyTo ? 'Post reply' : 'Post note'}
          </Button>
        </div>
      </form>
    </section>
  );
}
