"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  message?: string;
  status: "pending" | "confirmed" | "declined";
};

const STATUS_STYLE: Record<Booking["status"], string> = {
  pending: "text-orange border-orange/40 bg-orange-soft",
  confirmed: "text-teal border-teal/40 bg-teal-soft",
  declined: "text-muted border-line",
};

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadBookings(code: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?passcode=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load bookings.");
        setAuthed(false);
        return;
      }
      setBookings(data.bookings);
      setAuthed(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, passcode }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: data.booking.status } : b))
      );
    }
  }

  useEffect(() => {
    // No auto-login: passcode must be entered each session.
  }, []);

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-24">
        <h1 className="font-display text-2xl tracking-wide text-cream">
          ADMIN ACCESS
        </h1>
        <p className="text-sm text-muted">
          Enter the studio passcode to view and manage bookings.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="input"
          placeholder="Passcode"
          onKeyDown={(e) => e.key === "Enter" && loadBookings(passcode)}
        />
        {error && (
          <p className="font-mono text-xs text-orange">{error}</p>
        )}
        <button
          onClick={() => loadBookings(passcode)}
          disabled={loading}
          className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-bg disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-cream">
          BOOKINGS
        </h1>
        <span className="font-mono text-xs text-muted">
          {bookings.length} total
        </span>
      </div>

      <div className="mt-8 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-cream">
                  {format(new Date(b.eventDate), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3">
                  <p className="text-cream">{b.name}</p>
                  <p className="text-xs text-muted">{b.email} &middot; {b.phone}</p>
                </td>
                <td className="px-4 py-3 text-muted">{b.eventType}</td>
                <td className="px-4 py-3 text-muted">{b.location}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase ${STATUS_STYLE[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {b.status !== "confirmed" && (
                      <button
                        onClick={() => updateStatus(b._id, "confirmed")}
                        className="font-mono text-[10px] uppercase text-teal hover:underline"
                      >
                        Confirm
                      </button>
                    )}
                    {b.status !== "declined" && (
                      <button
                        onClick={() => updateStatus(b._id, "declined")}
                        className="font-mono text-[10px] uppercase text-muted hover:underline"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
