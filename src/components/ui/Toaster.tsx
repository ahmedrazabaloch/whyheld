"use client";

import { Toaster as SonnerToaster } from "sonner";
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      duration={5000}
      icons={{
        success: <Check className="h-5 w-5 text-[#74876B]" strokeWidth={2} />,
        error: <AlertCircle className="h-5 w-5 text-[#8b3a3a]" strokeWidth={2} />,
        info: <Info className="h-5 w-5 text-[#74876B]" strokeWidth={2} />,
        warning: <AlertTriangle className="h-5 w-5 text-[#b08d42]" strokeWidth={2} />,
      }}
      toastOptions={{
        classNames: {
          toast: "group font-sans flex items-start gap-4 w-full bg-[#F4EFE6] border border-[#D8D2C8] shadow-[0_20px_50px_-20px_rgba(51,51,47,0.15)] p-5 rounded-[1.25rem] transition-all duration-400 ease-out",
          title: "text-[0.95rem] font-display font-medium text-[#33332F] leading-tight",
          description: "text-sm text-[#504F4A] leading-relaxed mt-1",
          success: "border-[#74876B]/20",
          error: "border-[#8b3a3a]/20",
          warning: "border-[#b08d42]/20",
          info: "border-[#74876B]/20",
          icon: "mt-0.5",
        }
      }}
    />
  );
}
