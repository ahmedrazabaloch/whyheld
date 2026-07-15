"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  format,
} from "date-fns";

export interface DateRange {
  from?: Date | null;
  to?: Date | null;
}

export interface CalendarProps {
  mode?: "range";
  defaultMonth?: Date;
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
  className?: string;
}

export function Calendar({
  defaultMonth,
  selected,
  onSelect,
  numberOfMonths = 2,
  className = "",
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    defaultMonth || new Date()
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const months = Array.from({ length: numberOfMonths }).map((_, i) =>
    addMonths(currentMonth, i)
  );

  const handleDayClick = (day: Date) => {
    if (!onSelect) return;
    
    if (!selected?.from || (selected.from && selected.to)) {
      // Start a new range
      onSelect({ from: day, to: undefined });
    } else if (selected.from && !selected.to) {
      if (isBefore(day, selected.from)) {
        // Selected a day before 'from', so make it the new 'from'
        onSelect({ from: day, to: selected.from });
      } else {
        // Complete the range
        onSelect({ from: selected.from, to: day });
      }
    }
  };

  const isSelectedDay = (day: Date) => {
    return (
      (selected?.from && isSameDay(day, selected.from)) ||
      (selected?.to && isSameDay(day, selected.to))
    );
  };

  const isWithinRange = (day: Date) => {
    if (selected?.from && selected?.to) {
      return isAfter(day, selected.from) && isBefore(day, selected.to);
    }
    if (selected?.from && !selected?.to && hoverDate) {
      return (
        (isAfter(day, selected.from) && isBefore(day, hoverDate)) ||
        (isBefore(day, selected.from) && isAfter(day, hoverDate))
      );
    }
    return false;
  };

  const isRangeStart = (day: Date) => {
    if (!selected?.from) return false;
    if (selected.to && isBefore(selected.to, selected.from)) {
      return isSameDay(day, selected.to);
    }
    return isSameDay(day, selected.from);
  };

  const isRangeEnd = (day: Date) => {
    if (selected?.to) {
      return isSameDay(day, selected.to);
    }
    if (selected?.from && hoverDate && isAfter(hoverDate, selected.from)) {
      return isSameDay(day, hoverDate);
    }
    return false;
  };

  return (
    <div className={`p-3 flex flex-col sm:flex-row gap-8 ${className}`}>
      {months.map((month, index) => {
        const isFirstMonth = index === 0;
        const isLastMonth = index === months.length - 1;

        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
          <div key={month.toString()} className="space-y-4">
            <div className="flex justify-between items-center px-1">
              {isFirstMonth ? (
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-brand-text-primary/5 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : (
                <div className="w-7 h-7" /> // Placeholder to keep alignment
              )}
              
              <div className="text-sm font-medium">
                {format(month, "MMMM yyyy")}
              </div>

              {isLastMonth ? (
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-brand-text-primary/5 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="w-7 h-7" /> // Placeholder
              )}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-brand-text-secondary rounded-md w-9 font-normal text-[0.8rem]"
                >
                  {day}
                </div>
              ))}

              {days.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, month);
                const selected = isSelectedDay(day);
                const within = isWithinRange(day);
                const isStart = isRangeStart(day);
                const isEnd = isRangeEnd(day);

                if (!isCurrentMonth) {
                  return <div key={dayIdx} className="w-9 h-9" />;
                }

                // Determine cell background styling for ranges
                let cellBg = "";
                if (within) cellBg = "bg-brand-text-primary/5 rounded-none";
                else if (isStart && (selected || hoverDate)) cellBg = "bg-brand-text-primary/5 rounded-l-md rounded-r-none";
                else if (isEnd) cellBg = "bg-brand-text-primary/5 rounded-r-md rounded-l-none";

                return (
                  <div
                    key={dayIdx}
                    className={`relative w-9 h-9 p-0 flex items-center justify-center ${
                      selected || within ? cellBg : ""
                    }`}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      onClick={() => handleDayClick(day)}
                      className={`h-9 w-9 p-0 font-normal rounded-md transition-colors flex items-center justify-center ${
                        selected
                          ? "bg-brand-btn-primary text-brand-bg hover:bg-brand-btn-primary hover:text-brand-bg"
                          : "hover:bg-brand-text-primary/10 text-brand-text-primary"
                      } ${within && !selected ? "bg-transparent text-brand-text-primary" : ""}`}
                    >
                      {format(day, "d")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
