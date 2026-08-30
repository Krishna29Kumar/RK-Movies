"use client";

import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";

export default function BookPageContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") || undefined;

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
        Booking request
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-wide text-cream sm:text-4xl">
        BOOK A DATE
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Fill in your event details below. We&apos;ll confirm within 24 hours.
      </p>

      <div className="mt-8">
        <BookingForm initialDate={initialDate} />
      </div>
    </div>
  );
}
