"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startOfMonth, format } from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";
import StatsCards from "@/components/admin/StatsCards";
import BookingsTable from "@/components/admin/BookingsTable";
import AdminBookingsCalendar from "@/components/admin/AdminBookingsCalendar";
import RefundsPanel from "@/components/admin/RefundsPanel";

type Tab = "overview" | "bookings" | "refunds";

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [activeMonth, setActiveMonth] = useState<Date>(() => startOfMonth(new Date()));

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/bookings");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not load bookings.");
          return;
        }
        setBookings(data.bookings);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared updater — both the bookings table (Confirm/Decline) and the
  // refunds panel (Approve/Deny) call this same function.
  async function updateBooking(
    id: string,
    updates: { status?: AdminBooking["status"]; refundStatus?: AdminBooking["refundStatus"] }
  ): Promise<{ success: boolean; error?: string; booking?: AdminBooking }> {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, ...data.booking } : b))
        );
        return { success: true, booking: data.booking };
      } else {
        return { success: false, error: data.error || "Could not update booking." };
      }
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Loading…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className="font-mono text-xs text-orange">{error}</p>
      </div>
    );
  }

  const refundRequestCount = bookings.filter((b) => b.refundStatus === "requested").length;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: "Bookings" },
    { id: "refunds", label: "Refunds & Cancellations", badge: refundRequestCount || undefined },
  ];

  const now = new Date();
  const isCurrentMonth =
    activeMonth.getFullYear() === now.getFullYear() &&
    activeMonth.getMonth() === now.getMonth();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-wide text-cream">
          ADMIN PORTAL
        </h1>

        {!isCurrentMonth && (
          <div className="flex items-center gap-2 rounded-sm border border-orange/40 bg-orange/10 px-2.5 py-1 font-mono text-[11px] text-orange">
            <span>
              Month: <strong>{format(activeMonth, "MMMM yyyy").toUpperCase()}</strong>
            </span>
            <button
              type="button"
              onClick={() => setActiveMonth(startOfMonth(new Date()))}
              className="underline hover:text-cream ml-1"
              title="Return to current month"
            >
              Reset to Current
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
              tab === t.id
                ? "border-orange text-orange"
                : "border-transparent text-muted hover:text-cream",
            ].join(" ")}
          >
            {t.label}
            {!!t.badge && (
              <span className="rounded-full bg-orange px-1.5 py-0.5 text-[10px] text-bg">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div className="space-y-8">
            <StatsCards
              bookings={bookings}
              activeMonth={activeMonth}
              onMonthChange={setActiveMonth}
            />
            <div>
              <h2 className="font-display text-lg tracking-wide text-cream">
                Needs your attention
              </h2>
              <p className="mt-1 text-sm text-muted">
                Pending confirmations and refund requests, in one place.
              </p>
              <div className="mt-4">
                <BookingsTable
                  bookings={bookings.filter(
                    (b) => b.status === "pending" || b.refundStatus === "requested"
                  )}
                  onUpdate={updateBooking}
                />
              </div>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <AdminBookingsCalendar
            bookings={bookings}
            onUpdate={updateBooking}
            activeMonth={activeMonth}
            onMonthChange={setActiveMonth}
          />
        )}

        {tab === "refunds" && (
          <RefundsPanel
            bookings={bookings}
            onUpdate={updateBooking}
            activeMonth={activeMonth}
            onMonthChange={setActiveMonth}
          />
        )}
      </div>
    </div>
  );
}