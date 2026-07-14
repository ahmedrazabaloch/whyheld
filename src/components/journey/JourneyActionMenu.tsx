"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { surfaces, buttonStyles, formStyles } from "@/lib/design";
import { renameJourney, archiveJourney, deleteJourney } from "@/actions/journey-actions";

export interface JourneyActionMenuProps {
  id: string;
  currentTitle: string;
}

export function JourneyActionMenu({ id, currentTitle }: JourneyActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"rename" | "archive" | "delete" | null>(null);
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (action: "rename" | "archive" | "delete") => {
    setIsOpen(false);
    
    startTransition(async () => {
      let res;
      if (action === "rename") {
        res = await renameJourney(id, newTitle);
      } else if (action === "archive") {
        res = await archiveJourney(id);
      } else if (action === "delete") {
        res = await deleteJourney(id);
      }
      
      if (res?.success) {
        setActiveDialog(null);
      } else {
        alert(res?.error || "An error occurred");
      }
    });
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1.5 -mr-1.5 rounded-full hover:bg-brand-text-primary/5 transition-colors text-brand-text-secondary"
          aria-label="Actions"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-brand-card border border-brand-border shadow-panel z-10 overflow-hidden py-1">
            <button
              onClick={() => { setIsOpen(false); setActiveDialog("rename"); setNewTitle(currentTitle); }}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-text-primary hover:bg-brand-text-primary/5 transition-colors"
            >
              Rename
            </button>
            <button
              onClick={() => { setIsOpen(false); setActiveDialog("archive"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-brand-text-primary hover:bg-brand-text-primary/5 transition-colors"
            >
              Archive
            </button>
            <button
              onClick={() => { setIsOpen(false); setActiveDialog("delete"); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {activeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm p-4">
          <div className={`${surfaces.card} w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200`}>
            {activeDialog === "rename" && (
              <>
                <h3 className="font-display text-2xl font-light text-brand-text-primary mb-2">Rename Journey</h3>
                <p className="text-sm text-brand-text-secondary mb-6">Choose a new name for your itinerary.</p>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`${formStyles.input} mb-8`}
                  autoFocus
                  disabled={isPending}
                />
              </>
            )}

            {activeDialog === "archive" && (
              <>
                <h3 className="font-display text-2xl font-light text-brand-text-primary mb-2">Archive Journey</h3>
                <p className="text-sm text-brand-text-secondary mb-8">
                  This will hide the journey from your active list. You can still access it by filtering for archived journeys.
                </p>
              </>
            )}

            {activeDialog === "delete" && (
              <>
                <h3 className="font-display text-2xl font-light text-red-600 mb-2">Delete Journey</h3>
                <p className="text-sm text-brand-text-secondary mb-8">
                  Are you sure? This action will perform a <strong className="text-brand-text-primary">soft delete</strong>, removing the journey from your library while preserving it in the database for support recovery.
                </p>
              </>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveDialog(null)}
                className={buttonStyles.ghost}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(activeDialog)}
                className={activeDialog === "delete" ? `${buttonStyles.primary} !bg-red-600 hover:!bg-red-700 !text-white` : buttonStyles.primary}
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
