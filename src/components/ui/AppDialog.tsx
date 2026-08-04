"use client";

import type { ReactNode } from "react";
import { buttonStyles, surfaces } from "@/lib/design";

type AppDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  tone?: "default" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  /** When false, only a single dismiss button is shown (alert). */
  showCancel?: boolean;
  busy?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  children?: ReactNode;
};

/**
 * Shared alert / confirm modal — use instead of window.alert / window.confirm.
 */
export function AppDialog({
  open,
  title,
  description,
  tone = "default",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  showCancel = true,
  busy = false,
  onConfirm,
  onClose,
  children,
}: AppDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        className={`${surfaces.card} w-full max-w-md p-6 shadow-lg sm:p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="app-dialog-title"
          className={[
            "font-display text-2xl font-light tracking-tight",
            tone === "danger" ? "text-red-600" : "text-brand-text-primary",
          ].join(" ")}
        >
          {title}
        </h3>
        {description ? (
          <div className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
            {description}
          </div>
        ) : null}
        {children}

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {showCancel ? (
            <button
              type="button"
              className={buttonStyles.ghost}
              onClick={onClose}
              disabled={busy}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={
              tone === "danger"
                ? `${buttonStyles.primary} !bg-red-600 !text-white hover:!bg-red-700`
                : buttonStyles.primary
            }
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
