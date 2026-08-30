"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import BookingCalendar from "@/components/BookingCalendar";

export default function CheckDatePage() {
  const router = useRouter();
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.bookedDates) {
          setBookedDates(new Set(data.bookedDates as string[]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
        Availability
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-cream sm:text-4xl">
        CHECK A DATE
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        {loading
          ? "Loading calendar…"
          : "Booked dates are greyed out. Pick an open date to start a booking request."}
      </p>

      <div className="mt-8 max-w-md">
        <BookingCalendar
          bookedDates={bookedDates}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <button
          onClick={() =>
            router.push(`/dashboard/book?date=${format(selected, "yyyy-MM-dd")}`)
          }
          className="mt-6 rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90"
        >
          Book {format(selected, "d MMM yyyy")} &rarr;
        </button>
      )}
    </div>
  );
}
