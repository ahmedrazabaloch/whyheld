"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { surfaces, buttonStyles, formStyles } from "@/lib/design";
import {
  renameJourney,
  archiveJourney,
  deleteJourney,
  markJourneyCompleted,
} from "@/actions/journey-actions";

export interface JourneyListCardProps {
  id: string;
  title: string;
  destination: string;
  duration: string;
  status: string;
  stopCount: number;
  updatedDate: string;
}

type DialogKind = "rename" | "archive" | "delete" | "complete" | null;

export function JourneyListCard({
  id,
  title,
  destination,
  duration,
  status,
  stopCount,
  updatedDate,
}: JourneyListCardProps) {
  const [activeDialog, setActiveDialog] = useState<DialogKind>(null);
  const [newTitle, setNewTitle] = useState(title);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isCompleted = status === "COMPLETED";

  const openDialog = (kind: DialogKind) => {
    setActionError(null);
    if (kind === "rename") setNewTitle(title);
    setActiveDialog(kind);
  };

  const handleAction = (action: NonNullable<DialogKind>) => {
    setActionError(null);
    startTransition(async () => {
      let res;
      if (action === "rename") {
        res = await renameJourney(id, newTitle);
      } else if (action === "archive") {
        res = await archiveJourney(id);
      } else if (action === "delete") {
        res = await deleteJourney(id);
      } else {
        res = await markJourneyCompleted(id);
      }

      if (res?.success) {
        setActiveDialog(null);
        setActionError(null);
      } else {
        setActionError(res?.error || "Something went wrong. Please try again.");
      }
    });
  };

  const iconBtn =
    "inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-border/70 bg-brand-bg/40 px-3 text-xs font-medium text-brand-text-secondary transition-colors hover:border-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <article
        className={`${surfaces.card} relative flex w-full flex-col gap-5 p-5 transition-shadow duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6`}
      >
        <Link
          href={`/journeys/${id}`}
          className="absolute inset-0 z-0 rounded-[inherit]"
          aria-label={`View ${title}`}
        />

        <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`${surfaces.chip} inline-flex items-center gap-1.5`}>
              {status === "READY" || status === "COMPLETED" ? "READY" : status}
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-btn-primary/30 bg-brand-btn-primary/10 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-brand-btn-primary">
                <CheckIcon />
                Completed
              </span>
            ) : null}
          </div>

          <h3 className="font-display text-xl tracking-tight text-brand-text-primary sm:text-2xl">
            {title}
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-brand-text-secondary sm:grid-cols-4 sm:gap-4">
            <Meta label="Destination" value={destination} />
            <Meta label="Duration" value={duration} />
            <Meta
              label="Stops"
              value={`${stopCount} ${stopCount === 1 ? "stop" : "stops"}`}
            />
            <Meta label="Updated" value={updatedDate} />
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
          <button
            type="button"
            className={iconBtn}
            disabled={isPending}
            onClick={() => openDialog("rename")}
          >
            <RenameIcon />
            Rename
          </button>
          <button
            type="button"
            className={iconBtn}
            disabled={isPending}
            onClick={() => openDialog("archive")}
          >
            <ArchiveIcon />
            Archive
          </button>
          <button
            type="button"
            className={iconBtn}
            disabled={isPending || (status !== "READY" && status !== "COMPLETED")}
            onClick={() => openDialog("complete")}
          >
            <CheckIcon />
            {isCompleted ? "Mark ready" : "Mark completed"}
          </button>
          <button
            type="button"
            className={`${iconBtn} border-red-200 text-red-600 hover:border-red-300 hover:text-red-700`}
            disabled={isPending}
            onClick={() => openDialog("delete")}
          >
            <DeleteIcon />
            Delete
          </button>
        </div>
      </article>

      {activeDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 p-4 backdrop-blur-sm">
          <div
            className={`${surfaces.card} w-full max-w-md p-6 sm:p-8`}
            role="dialog"
            aria-modal="true"
          >
            {activeDialog === "rename" ? (
              <>
                <h3 className="mb-2 font-display text-2xl font-light text-brand-text-primary">
                  Rename Journey
                </h3>
                <p className="mb-6 text-sm text-brand-text-secondary">
                  Choose a new name for your itinerary.
                </p>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`${formStyles.input} mb-8`}
                  autoFocus
                  disabled={isPending}
                />
              </>
            ) : null}

            {activeDialog === "archive" ? (
              <>
                <h3 className="mb-2 font-display text-2xl font-light text-brand-text-primary">
                  Archive Journey
                </h3>
                <p className="mb-8 text-sm text-brand-text-secondary">
                  This will hide the journey from your active list. You can still
                  find it by filtering for archived journeys.
                </p>
              </>
            ) : null}

            {activeDialog === "complete" ? (
              <>
                <h3 className="mb-2 font-display text-2xl font-light text-brand-text-primary">
                  {isCompleted ? "Return to Ready" : "Mark as Completed"}
                </h3>
                <p className="mb-8 text-sm text-brand-text-secondary">
                  {isCompleted
                    ? "This journey will move back to your ready list."
                    : "Mark this journey as past — it will leave your ready list and live with your completed journeys."}
                </p>
              </>
            ) : null}

            {activeDialog === "delete" ? (
              <>
                <h3 className="mb-2 font-display text-2xl font-light text-red-600">
                  Delete Journey
                </h3>
                <p className="mb-8 text-sm text-brand-text-secondary">
                  Are you sure? This removes the journey from your library while
                  preserving it for support recovery.
                </p>
              </>
            ) : null}

            {actionError ? (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {actionError}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveDialog(null);
                  setActionError(null);
                }}
                className={buttonStyles.ghost}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction(activeDialog)}
                className={
                  activeDialog === "delete"
                    ? `${buttonStyles.primary} !bg-red-600 !text-white hover:!bg-red-700`
                    : buttonStyles.primary
                }
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-80">
        {label}
      </span>
      <span className="block truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function RenameIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
