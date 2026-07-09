"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-center"
      duration={4000}
      toastOptions={{
        classNames: {
          toast: "group font-sans flex items-center gap-3 w-full bg-brand-card border border-brand-border/60 shadow-panel p-4 rounded-2xl",
          title: "text-sm font-medium text-brand-text-primary",
          description: "text-sm text-brand-text-secondary",
          success: "border-green-500/20 bg-green-500/5",
          error: "border-red-500/20 bg-red-500/5",
          warning: "border-yellow-500/20 bg-yellow-500/5",
          info: "border-brand-btn-primary/20 bg-brand-btn-primary/5",
          icon: "group-data-[type=success]:text-green-500 group-data-[type=error]:text-red-500 group-data-[type=warning]:text-yellow-500 group-data-[type=info]:text-brand-btn-primary",
        }
      }}
    />
  );
}
