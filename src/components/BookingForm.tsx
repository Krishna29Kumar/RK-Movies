"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import BookingCalendar from "@/components/BookingCalendar";
import { EVENT_TYPES } from "@/lib/booking-constants";

type Status = "idle" | "submitting" | "success" | "error";

export default function BookingForm() {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: EVENT_TYPES[0],
    location: "",
    message: "",
  });

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.bookedDates) {
          setBookedDates(new Set(data.bookedDates as string[]));
        }
      })
      .catch(() => {
        // Non-fatal: calendar still works, it just won't grey out booked days.
      })
      .finally(() => setLoadingAvailability(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) {
      setStatus("error");
      setErrorMessage("Pick a date on the calendar first.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventDate: format(selectedDate, "yyyy-MM-dd"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setBookedDates((prev) => new Set(prev).add(format(selectedDate, "yyyy-MM-dd")));
    } catch {
      setStatus("error");
      setErrorMessage("Could not reach the server. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-line-strong bg-bg-raised p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal">
          Request received
        </p>
        <h2 className="mt-3 font-display text-2xl tracking-wide text-cream">
          {selectedDate ? format(selectedDate, "d MMMM yyyy") : "Your date"} is on hold
        </h2>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll confirm by email within 24 hours. That date is now marked
          unavailable for other bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
      <BookingCalendar
        bookedDates={bookedDates}
        selected={selectedDate}
        onSelect={setSelectedDate}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Selected date
          </p>
          <p className="font-display text-xl tracking-wide text-cream">
            {loadingAvailability
              ? "Loading calendar…"
              : selectedDate
              ? format(selectedDate, "EEEE, d MMMM yyyy")
              : "Pick a date on the calendar"}
          </p>
        </div>

        <Field label="Full name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Phone">
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Event type">
          <select
            required
            value={form.eventType}
            onChange={(e) =>
              setForm({ ...form, eventType: e.target.value as typeof form.eventType })
            }
            className="input"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Venue / city">
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="e.g. Taj Palace, New Delhi"
          />
        </Field>

        <Field label="Anything we should know? (optional)">
          <textarea
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input resize-none"
            placeholder="Expected guest count, schedule, specific shots you want…"
          />
        </Field>

        {status === "error" && (
          <p className="rounded-sm border border-orange/40 bg-orange-soft px-3 py-2 font-mono text-xs text-orange">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-sm bg-orange px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Request this date"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
