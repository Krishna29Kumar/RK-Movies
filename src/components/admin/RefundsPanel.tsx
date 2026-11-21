"use client";

import { useMemo, useState } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";

type SectionTab = "all" | "review" | "approved" | "denied";

export default function RefundsPanel({
  bookings,
  onUpdate,
  activeMonth,
  onMonthChange,
}: {
  bookings: AdminBooking[];
  onUpdate: (
    id: string,
    updates: {
      status?: AdminBooking["status"];
      refundStatus?: AdminBooking["refundStatus"];
    }
  ) => void;
  activeMonth: Date;
  onMonthChange: (month: Date) => void;
}) {
  const [activeTab, setActiveTab] = useState<SectionTab>("all");

  const vYear = activeMonth.getFullYear();
  const vMonth = activeMonth.getMonth();

  // Navigate months
  const handlePrevMonth = () => onMonthChange(subMonths(activeMonth, 1));
  const handleNextMonth = () => onMonthChange(addMonths(activeMonth, 1));
  const handleToday = () => onMonthChange(startOfMonth(new Date()));

  // Filter cancellations for the selected month
  const monthCancelled = useMemo(() => {
    return bookings
      .filter((b) => {
        // Must either be marked cancelled or have a refund request
        const isCancellation = b.status === "cancelled" || b.refundStatus === "requested";
        if (!isCancellation) return false;

        const cDate = b.cancelledAt ? new Date(b.cancelledAt) : null;
        const eDate = b.eventDate ? new Date(b.eventDate) : null;

        const cMatch =
          cDate && !isNaN(cDate.getTime()) && cDate.getFullYear() === vYear && cDate.getMonth() === vMonth;
        const eMatch =
          eDate && !isNaN(eDate.getTime()) && eDate.getFullYear() === vYear && eDate.getMonth() === vMonth;

        return Boolean(cMatch || (!cDate && eMatch));
      })
      .sort((a, b) => {
        // Sort by cancellation date descending or event date
        const timeA = a.cancelledAt ? new Date(a.cancelledAt).getTime() : new Date(a.eventDate).getTime();
        const timeB = b.cancelledAt ? new Date(b.cancelledAt).getTime() : new Date(b.eventDate).getTime();
        return timeB - timeA;
      });
  }, [bookings, vYear, vMonth]);

  // Group into Under Review, Approved, and Denied
  const underReview = useMemo(
    () => monthCancelled.filter((b) => b.refundStatus === "requested"),
    [monthCancelled]
  );
  const approved = useMemo(
    () => monthCancelled.filter((b) => b.refundStatus === "approved"),
    [monthCancelled]
  );
  const denied = useMemo(
    () => monthCancelled.filter((b) => b.refundStatus === "denied"),
    [monthCancelled]
  );

  // Totals for this month
  const totalApprovedAmount = approved.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalReviewAmount = underReview.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);

  const renderBookingCard = (b: AdminBooking) => {
    return (
      <div
        key={b._id}
        className="rounded-sm border border-line-strong bg-bg-raised p-4 sm:p-5 transition-colors hover:border-line"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg tracking-wide text-cream">
                {b.name}
              </span>
              <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                {b.eventType}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted">
              {b.email} &middot; {b.phone}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
              <span>
                Shoot Date:{" "}
                <span className="text-cream">
                  {format(new Date(b.eventDate), "d MMMM yyyy")}
                </span>
              </span>
              {b.cancelledAt && (
                <span>
                  &middot; Cancelled On:{" "}
                  <span className="text-orange">
                    {format(new Date(b.cancelledAt), "d MMM yyyy, h:mm a")}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-xs text-muted">Advance Paid</p>
            <p className="font-display text-xl tracking-wide text-cream">
              ₹{b.advanceAmount ? b.advanceAmount.toLocaleString("en-IN") : 0}
            </p>
            <div className="mt-1">
              {b.refundStatus === "requested" && (
                <span className="inline-block rounded-full bg-orange/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-orange border border-orange/40">
                  Under Review
                </span>
              )}
              {b.refundStatus === "approved" && (
                <span className="inline-block rounded-full bg-teal/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-teal border border-teal/40">
                  Refund Approved
                </span>
              )}
              {b.refundStatus === "denied" && (
                <span className="inline-block rounded-full bg-line px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted border border-line-strong">
                  Refund Denied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cancellation Message */}
        {b.cancellationMessage ? (
          <div className="mt-3.5 rounded-sm border border-line bg-bg p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
              Client&apos;s Stated Reason
            </p>
            <p className="mt-1 text-sm text-cream italic">
              &ldquo;{b.cancellationMessage}&rdquo;
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-sm border border-line/50 bg-bg/50 px-3 py-2 text-xs text-muted">
            Standard cancellation request &mdash; no specific reason entered.
          </div>
        )}

        {/* Action buttons for Under Review */}
        {b.refundStatus === "requested" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line/60 pt-3">
            <button
              type="button"
              onClick={() => onUpdate(b._id, { refundStatus: "approved" })}
              className="rounded-sm bg-teal px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg font-semibold transition-opacity hover:opacity-90 shadow-sm"
            >
              Approve Refund (₹{b.advanceAmount})
            </button>
            <button
              type="button"
              onClick={() => onUpdate(b._id, { refundStatus: "denied" })}
              className="rounded-sm border border-orange/50 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-orange hover:bg-orange/10 transition-colors"
            >
              Deny Refund
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation & Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-bg-raised p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded-sm border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-line-strong hover:text-cream"
            title="Previous month"
          >
            &larr; Prev
          </button>
          <h2 className="font-display text-xl tracking-wide text-cream sm:text-2xl px-2">
            {format(activeMonth, "MMMM yyyy").toUpperCase()}
          </h2>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded-sm border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-line-strong hover:text-cream"
            title="Next month"
          >
            Next &rarr;
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="ml-2 font-mono text-xs text-orange hover:underline"
          >
            This Month
          </button>
        </div>

        {/* Quick Month Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="rounded-sm border border-line bg-bg px-3 py-1">
            <span className="text-muted">In Review: </span>
            <span className="text-orange font-semibold">{underReview.length}</span>
            {totalReviewAmount > 0 && (
              <span className="text-muted text-[10px]"> (₹{totalReviewAmount.toLocaleString("en-IN")})</span>
            )}
          </div>
          <div className="rounded-sm border border-line bg-bg px-3 py-1">
            <span className="text-muted">Approved: </span>
            <span className="text-teal font-semibold">{approved.length}</span>
            {totalApprovedAmount > 0 && (
              <span className="text-muted text-[10px]"> (₹{totalApprovedAmount.toLocaleString("en-IN")})</span>
            )}
          </div>
          <div className="rounded-sm border border-line bg-bg px-3 py-1">
            <span className="text-muted">Denied: </span>
            <span className="text-muted font-semibold">{denied.length}</span>
          </div>
        </div>
      </div>

      {/* Section Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            activeTab === "all"
              ? "bg-orange text-bg font-semibold"
              : "border border-line text-muted hover:text-cream"
          }`}
        >
          All Sections ({monthCancelled.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("review")}
          className={`relative rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            activeTab === "review"
              ? "bg-orange text-bg font-semibold"
              : "border border-line text-muted hover:text-cream"
          }`}
        >
          Under Review ({underReview.length})
          {underReview.length > 0 && activeTab !== "review" && (
            <span className="ml-1.5 rounded-full bg-orange px-1.5 py-0.2 text-[10px] text-bg">
              !
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approved")}
          className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            activeTab === "approved"
              ? "bg-teal text-bg font-semibold"
              : "border border-line text-muted hover:text-cream"
          }`}
        >
          Approved ({approved.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("denied")}
          className={`rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
            activeTab === "denied"
              ? "bg-cream text-bg font-semibold"
              : "border border-line text-muted hover:text-cream"
          }`}
        >
          Denied ({denied.length})
        </button>
      </div>

      {monthCancelled.length === 0 ? (
        <div className="rounded-sm border border-line bg-bg-raised p-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            No cancellation or refund requests for {format(activeMonth, "MMMM yyyy")}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* SECTION 1: UNDER REVIEW */}
          {(activeTab === "all" || activeTab === "review") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-orange/30 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg tracking-wide text-orange">
                    UNDER REVIEW
                  </h3>
                  <span className="rounded-full bg-orange/20 px-2 py-0.5 font-mono text-xs font-semibold text-orange border border-orange/40">
                    {underReview.length}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted">
                  Action required &mdash; Approve or deny client refunds
                </span>
              </div>

              {underReview.length === 0 ? (
                <div className="rounded-sm border border-line/60 bg-bg p-6 text-center">
                  <p className="font-mono text-xs text-muted">
                    No refund requests pending review for {format(activeMonth, "MMMM yyyy")}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {underReview.map((b) => renderBookingCard(b))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: APPROVED */}
          {(activeTab === "all" || activeTab === "approved") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-teal/30 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg tracking-wide text-teal">
                    APPROVED REFUNDS
                  </h3>
                  <span className="rounded-full bg-teal/20 px-2 py-0.5 font-mono text-xs font-semibold text-teal border border-teal/40">
                    {approved.length}
                  </span>
                </div>
                <span className="font-mono text-xs text-teal">
                  Total Refunded: ₹{totalApprovedAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {approved.length === 0 ? (
                <div className="rounded-sm border border-line/60 bg-bg p-6 text-center">
                  <p className="font-mono text-xs text-muted">
                    No approved refunds for {format(activeMonth, "MMMM yyyy")}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approved.map((b) => renderBookingCard(b))}
                </div>
              )}
            </section>
          )}

          {/* SECTION 3: DENIED */}
          {(activeTab === "all" || activeTab === "denied") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg tracking-wide text-cream">
                    DENIED REFUNDS
                  </h3>
                  <span className="rounded-full bg-line px-2 py-0.5 font-mono text-xs font-semibold text-muted">
                    {denied.length}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted">
                  Refund declined &mdash; advance retained as per cancellation policy
                </span>
              </div>

              {denied.length === 0 ? (
                <div className="rounded-sm border border-line/60 bg-bg p-6 text-center">
                  <p className="font-mono text-xs text-muted">
                    No denied refund requests for {format(activeMonth, "MMMM yyyy")}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {denied.map((b) => renderBookingCard(b))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
