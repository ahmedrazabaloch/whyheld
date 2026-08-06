"use client";

import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { buttonStyles } from "@/lib/design";
import { buildBookSuggestions } from "@/lib/bookshop/suggestions";

type Props = {
  destination: string;
};

/**
 * Optional Bookshop.org prompt — only mounted for US users (server-gated).
 */
export function BookSuggestionPrompt({ destination }: Props) {
  const [open, setOpen] = useState(false);
  const [declined, setDeclined] = useState(false);

  const suggestions = useMemo(
    () => buildBookSuggestions(destination),
    [destination],
  );

  if (declined) return null;

  if (!open) {
    return (
      <aside
        className="rounded-2xl border border-brand-border/70 bg-brand-card/70 px-4 py-4 sm:px-5"
        aria-label="Book suggestion"
      >
        <div className="flex gap-3.5">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/80 bg-white text-brand-btn-primary"
            aria-hidden
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brand-text-primary">
              Would you like a book suggestion for this journey?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">
              Fiction and non-fiction tied to {destination.trim() || "your destination"} —
              through Raven&apos;s Bookshop.org storefront, supporting independent bookstores.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonStyles.primary + " !min-h-[40px] !px-4 !text-sm"}
                onClick={() => setOpen(true)}
              >
                Yes, show books
              </button>
              <button
                type="button"
                className={buttonStyles.ghost + " !min-h-[40px] !px-3 !text-sm"}
                onClick={() => setDeclined(true)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="rounded-2xl border border-brand-border/70 bg-brand-card/70 px-4 py-4 sm:px-5"
      aria-label="Book suggestions"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/80 bg-white text-brand-btn-primary"
            aria-hidden
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-brand-text-primary">
              Books for {destination.trim() || "your journey"}
            </p>
            <p className="mt-0.5 text-xs text-brand-text-secondary">
              Opens on Bookshop.org — purchases support independent bookstores.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs text-brand-text-secondary underline-offset-2 hover:text-brand-text-primary hover:underline"
          onClick={() => setDeclined(true)}
        >
          Hide
        </button>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {suggestions.map((book) => (
          <li key={book.kind}>
            <a
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-brand-border/70 bg-brand-bg/60 px-3.5 py-3 transition-colors hover:border-brand-btn-primary/40 hover:bg-brand-btn-primary/5"
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-btn-primary">
                {book.label}
              </span>
              <span className="mt-1 block text-sm text-brand-text-primary">
                {book.blurb}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-btn-primary">
                Browse on Bookshop.org
                <span aria-hidden>→</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
