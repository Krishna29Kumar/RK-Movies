"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminBooking } from "@/lib/admin-types";
import StatsCards from "@/components/admin/StatsCards";
import BookingsTable from "@/components/admin/BookingsTable";
import RefundsPanel from "@/components/admin/RefundsPanel";

type Tab = "overview" | "bookings" | "refunds";

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

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
  ) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, ...data.booking } : b))
      );
    }
  }

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wide text-cream">
          ADMIN PORTAL
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted">{bookings.length} bookings total</span>
          <button
            onClick={handleSignOut}
            className="rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:text-cream"
          >
            Sign out
          </button>
        </div>
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
            <StatsCards bookings={bookings} />
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
          <BookingsTable bookings={bookings} onUpdate={updateBooking} />
        )}

        {tab === "refunds" && (
          <RefundsPanel bookings={bookings} onUpdate={updateBooking} />
        )}
      </div>
    </div>
  );
}