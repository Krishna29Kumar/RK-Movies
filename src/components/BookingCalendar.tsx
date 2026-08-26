"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function BookingCalendar({
  bookedDates,
  selected,
  onSelect,
}: {
  bookedDates: Set<string>;
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const leadingBlanks = getDay(startOfMonth(visibleMonth));

  return (
    <div className="rounded-sm border border-line-strong bg-bg-raised p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
          className="rounded-sm border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-cream"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <p className="font-display text-lg tracking-wide text-cream">
          {format(visibleMonth, "MMMM yyyy").toUpperCase()}
        </p>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          className="rounded-sm border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-cream"
          aria-label="Next month"
        >
          &rarr;
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="py-1 text-center font-mono text-[10px] uppercase text-muted"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isBooked = bookedDates.has(key);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const disabled = isPast || isBooked;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={[
                "aspect-square rounded-sm font-mono text-xs transition-colors",
                disabled
                  ? "cursor-not-allowed text-muted/40 line-through"
                  : "text-cream hover:bg-teal-soft",
                isSelected ? "bg-orange text-bg hover:bg-orange" : "",
                isBooked && !isPast ? "bg-line-strong/40" : "",
              ].join(" ")}
              title={isBooked ? "Already booked" : undefined}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-line-strong/40" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-line" /> Open
        </span>
      </div>
    </div>
  );
}
