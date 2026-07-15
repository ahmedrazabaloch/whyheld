"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, type DateRange } from "./Calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onUpdate: (start: Date | null, end: Date | null) => void;
}

export function DateRangePicker({ startDate, endDate, onUpdate }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPopoverStyle({
          position: "absolute",
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    onUpdate(range?.from || null, range?.to || null);
  };

  const formattedDate = startDate
    ? endDate
      ? `${format(startDate, "LLL dd, y")} - ${format(endDate, "LLL dd, y")}`
      : format(startDate, "LLL dd, y")
    : "Pick your dates";

  const popoverContent = (
    <div
      ref={popoverRef}
      className="z-[9999] rounded-2xl border border-brand-card-border bg-brand-card p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      style={popoverStyle}
    >
      <Calendar
        mode="range"
        defaultMonth={startDate || undefined}
        selected={{ from: startDate, to: endDate }}
        onSelect={handleSelect}
        numberOfMonths={2}
      />
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 rounded-xl border border-brand-border bg-transparent px-4 py-3.5 text-left text-sm font-medium text-brand-text-primary transition-colors hover:border-brand-btn-primary/40 focus:border-brand-btn-primary focus:outline-none focus:ring-1 focus:ring-brand-btn-primary"
      >
        <span className="truncate">{formattedDate}</span>
        <CalendarIcon className="h-5 w-5 text-brand-text-secondary flex-shrink-0" />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(popoverContent, document.body)
        : null}
    </>
  );
}
