"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLE: Record<AdminBooking["status"], string> = {
  pending: "text-orange border-orange/40 bg-orange-soft",
  confirmed: "text-teal border-teal/40 bg-teal-soft",
  declined: "text-muted border-line bg-bg",
  cancelled: "text-muted border-line bg-bg",
};

const REFUND_STYLE: Record<AdminBooking["refundStatus"], string> = {
  not_applicable: "text-muted",
  requested: "text-orange",
  approved: "text-teal",
  denied: "text-muted",
};

export default function AdminBookingsCalendar({
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
  ) => Promise<{ success: boolean; error?: string; booking?: AdminBooking }> | Promise<any> | void;
  activeMonth: Date;
  onMonthChange: (month: Date) => void;
}) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [viewMode, setViewMode] = useState<"date" | "month">("date");

  // Double confirmation state for declining bookings (Step 1 -> Step 2 -> Execute)
  const [declineStage, setDeclineStage] = useState<0 | 1 | 2>(0);
  const [isDecliningProcessing, setIsDecliningProcessing] = useState(false);
  const [declineError, setDeclineError] = useState("");

  const handleCloseBooking = () => {
    setSelectedBooking(null);
    setDeclineStage(0);
    setDeclineError("");
  };

  const handleExecuteDecline = async () => {
    if (!selectedBooking) return;
    setIsDecliningProcessing(true);
    setDeclineError("");
    try {
      const result = await onUpdate(selectedBooking._id, { status: "declined" });
      if (result && typeof result === "object" && "success" in result && !result.success) {
        setDeclineError(result.error || "Failed to decline and refund. Please try again.");
        setIsDecliningProcessing(false);
        return;
      }
      setSelectedBooking({
        ...selectedBooking,
        status: "declined",
        refundStatus: "approved",
      });
      setDeclineStage(0);
    } catch (err: any) {
      setDeclineError(err?.message || "An unexpected error occurred while processing refund.");
    } finally {
      setIsDecliningProcessing(false);
    }
  };

  // Keep selectedDate within activeMonth when activeMonth changes from elsewhere
  useEffect(() => {
    if (
      selectedDate.getMonth() !== activeMonth.getMonth() ||
      selectedDate.getFullYear() !== activeMonth.getFullYear()
    ) {
      setSelectedDate(startOfMonth(activeMonth));
    }
  }, [activeMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // All days in the active month
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(activeMonth);
    const end = endOfMonth(activeMonth);
    return eachDayOfInterval({ start, end });
  }, [activeMonth]);

  const leadingBlanks = getDay(startOfMonth(activeMonth));

  // Filter bookings belonging to the active month
  const monthBookings = useMemo(() => {
    const vYear = activeMonth.getFullYear();
    const vMonth = activeMonth.getMonth();
    return bookings
      .filter((b) => {
        const d = new Date(b.eventDate);
        return !isNaN(d.getTime()) && d.getMonth() === vMonth && d.getFullYear() === vYear;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [bookings, activeMonth]);

  // Group bookings by date string (yyyy-MM-dd)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, AdminBooking[]>();
    monthBookings.forEach((b) => {
      const key = format(new Date(b.eventDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    return map;
  }, [monthBookings]);

  // Bookings for the currently selected date
  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const dateBookings = bookingsByDate.get(selectedKey) || [];

  // Month navigation helpers
  const handlePrevMonth = () => {
    const prev = subMonths(activeMonth, 1);
    onMonthChange(prev);
    setSelectedDate(startOfMonth(prev));
  };

  const handleNextMonth = () => {
    const next = addMonths(activeMonth, 1);
    onMonthChange(next);
    setSelectedDate(startOfMonth(next));
  };

  const handleCurrentMonth = () => {
    const cur = startOfMonth(new Date());
    onMonthChange(cur);
    setSelectedDate(startOfDay(new Date()));
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation & Controls Bar */}
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
            onClick={handleCurrentMonth}
            className="ml-2 font-mono text-xs text-orange hover:underline"
          >
            Today
          </button>
        </div>

        {/* View mode toggle (Date-wise vs Month-wise) */}
        <div className="flex items-center gap-1 rounded-sm border border-line bg-bg p-1">
          <button
            type="button"
            onClick={() => setViewMode("date")}
            className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              viewMode === "date"
                ? "bg-orange text-bg font-semibold"
                : "text-muted hover:text-cream"
            }`}
          >
            Date View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              viewMode === "month"
                ? "bg-orange text-bg font-semibold"
                : "text-muted hover:text-cream"
            }`}
          >
            Month List ({monthBookings.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Selected Date / Month Bookings on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* CALENDAR */}
        <div className="rounded-sm border border-line bg-bg-raised p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
              Booking Calendar
            </span>
            <span className="font-mono text-[11px] text-muted">
              {monthBookings.length} total shoot{monthBookings.length === 1 ? "" : "s"} this month
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="py-1.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted font-semibold"
              >
                {w}
              </div>
            ))}

            {/* Leading blank slots */}
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[58px] rounded-sm bg-transparent" />
            ))}

            {/* Day slots */}
            {daysInMonth.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd");
              const bookingsOnDay = bookingsByDate.get(dayKey) || [];
              const hasBookings = bookingsOnDay.length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, today);

              // Check if any booking on this date is confirmed or pending
              const hasConfirmed = bookingsOnDay.some((b) => b.status === "confirmed");
              const hasPending = bookingsOnDay.some((b) => b.status === "pending");

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode("date");
                  }}
                  className={[
                    "relative flex min-h-[64px] flex-col justify-between rounded-sm border p-1.5 text-left transition-all",
                    isSelected
                      ? "border-orange bg-orange/15 shadow-sm ring-1 ring-orange/40"
                      : hasBookings
                      ? "border-line-strong bg-bg hover:border-orange/60"
                      : "border-line/60 bg-bg/50 hover:bg-bg hover:border-line-strong",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        "font-mono text-xs",
                        isToday
                          ? "rounded-full bg-cream text-bg px-1.5 py-0.2 font-bold"
                          : isSelected
                          ? "font-bold text-orange"
                          : hasBookings
                          ? "text-cream font-medium"
                          : "text-muted",
                      ].join(" ")}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Status dot */}
                    {hasBookings && (
                      <span className="flex items-center gap-1">
                        {hasConfirmed && <span className="h-1.5 w-1.5 rounded-full bg-teal" />}
                        {hasPending && <span className="h-1.5 w-1.5 rounded-full bg-orange" />}
                      </span>
                    )}
                  </div>

                  {/* Bookings badge on this date */}
                  {hasBookings && (
                    <div className="mt-1">
                      <span
                        className={[
                          "block truncate rounded px-1 py-0.5 font-mono text-[9px] uppercase tracking-tight",
                          hasConfirmed
                            ? "bg-teal-soft text-teal font-semibold"
                            : "bg-orange-soft text-orange font-semibold",
                        ].join(" ")}
                      >
                        {bookingsOnDay.length === 1
                          ? bookingsOnDay[0].eventType
                          : `${bookingsOnDay.length} shoots`}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 font-mono text-[10px] uppercase text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange" /> Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-orange bg-orange/20" /> Selected Date
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: DATE BOOKINGS (ONE UNDER ANOTHER) OR MONTH-WISE LIST */}
        <div className="flex flex-col rounded-sm border border-line bg-bg-raised p-4 sm:p-5">
          {viewMode === "date" ? (
            <>
              {/* Date Header */}
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-orange">
                    Bookings for Date
                  </p>
                  <h3 className="font-display text-xl tracking-wide text-cream sm:text-2xl">
                    {format(selectedDate, "EEEE, d MMMM yyyy")}
                  </h3>
                </div>
                <span className="rounded-full bg-bg px-2.5 py-1 font-mono text-xs text-muted">
                  {dateBookings.length} booking{dateBookings.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Bookings Listed One Under Another */}
              {dateBookings.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
                  {dateBookings.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className="group cursor-pointer rounded-sm border border-line bg-bg p-4 transition-all hover:border-orange hover:bg-bg-raised-2 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base tracking-wide text-cream group-hover:text-orange transition-colors">
                              {b.name}
                            </span>
                            <span
                              className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase ${
                                STATUS_STYLE[b.status]
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-xs text-orange font-medium">
                            {b.eventType.toUpperCase()} &middot; {b.shootType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-cream font-semibold">
                            ₹{b.advanceAmount.toLocaleString("en-IN")}
                          </p>
                          <span
                            className={`font-mono text-[10px] uppercase ${
                              b.paymentStatus === "paid" ? "text-teal" : "text-orange"
                            }`}
                          >
                            Advance {b.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/60 pt-2 font-mono text-xs text-muted">
                        <div>
                          <span className="block text-[10px] uppercase text-muted/70">Timing</span>
                          <span className="text-cream">{b.startTime} – {b.endTime} ({b.durationHours}h)</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-muted/70">Cameras</span>
                          <span className="text-cream">{b.cameraCount}&times; {b.cameraType}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-orange group-hover:underline">
                        <span className="truncate text-muted">{b.phone}</span>
                        <span className="font-mono text-[11px] font-semibold">View all details &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <div className="h-10 w-10 rounded-full border border-line flex items-center justify-center text-muted mb-3">
                    📅
                  </div>
                  <p className="font-display text-lg text-cream">No Bookings on this Date</p>
                  <p className="mt-1 max-w-xs text-xs text-muted">
                    Click any highlighted date on the calendar to view its scheduled bookings.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Month-wise Bookings Header */}
              <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-orange">
                    All Bookings Monthwise
                  </p>
                  <h3 className="font-display text-xl tracking-wide text-cream sm:text-2xl">
                    {format(activeMonth, "MMMM yyyy").toUpperCase()}
                  </h3>
                </div>
                <span className="rounded-full bg-bg px-2.5 py-1 font-mono text-xs text-muted">
                  {monthBookings.length} total
                </span>
              </div>

              {/* Month-wise Bookings List One Under Another */}
              {monthBookings.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
                  {monthBookings.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBooking(b)}
                      className="group cursor-pointer rounded-sm border border-line bg-bg p-3.5 transition-all hover:border-orange hover:bg-bg-raised-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-orange font-bold">
                              {format(new Date(b.eventDate), "d MMM")}
                            </span>
                            <span className="text-cream font-medium group-hover:text-orange transition-colors">
                              {b.name}
                            </span>
                            <span
                              className={`rounded-sm border px-1.5 py-0.2 font-mono text-[9px] uppercase ${
                                STATUS_STYLE[b.status]
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted truncate">
                            {b.eventType} &middot; {b.startTime}–{b.endTime} &middot; {b.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-cream font-semibold">
                            ₹{b.advanceAmount.toLocaleString("en-IN")}
                          </p>
                          <span className="font-mono text-[10px] text-orange group-hover:underline">
                            Details &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <p className="font-display text-lg text-cream">No Bookings in this Month</p>
                  <p className="mt-1 text-xs text-muted">Use the navigation above to view other months.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* FULL BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-bg/85 backdrop-blur-md transition-opacity"
            onClick={handleCloseBooking}
          />

          {/* Modal Container */}
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-sm border border-line-strong bg-bg-raised shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-2xl tracking-wide text-cream">
                    {selectedBooking.name}
                  </h3>
                  <span
                    className={`rounded-sm border px-2.5 py-0.5 font-mono text-[11px] uppercase ${
                      STATUS_STYLE[selectedBooking.status]
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-orange uppercase tracking-wider">
                  {selectedBooking.eventType} &middot; {selectedBooking.shootType}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseBooking}
                className="rounded-sm border border-line p-2 text-muted hover:border-line-strong hover:text-cream"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body with All Booking Details */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
              {/* Event Timing & Date Banner */}
              <div className="rounded-sm border border-line bg-bg p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-muted">Event Date</span>
                    <span className="font-display text-base text-cream">
                      {format(new Date(selectedBooking.eventDate), "d MMMM yyyy")}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-muted">Timing</span>
                    <span className="font-display text-base text-cream">
                      {selectedBooking.startTime} – {selectedBooking.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-muted">Duration</span>
                    <span className="font-display text-base text-teal">
                      {selectedBooking.durationHours} hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Contact Details */}
              <div className="rounded-sm border border-line bg-bg p-4">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-orange mb-2">
                  Client Information
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Phone</span>
                    <a
                      href={`tel:${selectedBooking.phone}`}
                      className="font-mono text-sm text-cream hover:text-orange underline"
                    >
                      {selectedBooking.phone}
                    </a>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Email</span>
                    <a
                      href={`mailto:${selectedBooking.email}`}
                      className="font-mono text-sm text-cream hover:text-orange underline"
                    >
                      {selectedBooking.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Equipment & Setup */}
              <div className="rounded-sm border border-line bg-bg p-4">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-orange mb-2">
                  Equipment &amp; Setup
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Camera Count</span>
                    <span className="font-mono text-sm text-cream font-semibold">
                      {selectedBooking.cameraCount} Cameras
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Camera Model / Format</span>
                    <span className="font-mono text-sm text-cream">
                      {selectedBooking.cameraType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Venue Address */}
              <div className="rounded-sm border border-line bg-bg p-4">
                <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-orange mb-1">
                  Event Location / Address
                </span>
                <p className="text-sm text-cream leading-relaxed">{selectedBooking.address}</p>
              </div>

              {/* Client Notes / Instructions */}
              {selectedBooking.message && (
                <div className="rounded-sm border border-line bg-bg p-4">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-orange mb-1">
                    Special Notes from Client
                  </span>
                  <p className="text-sm italic text-cream leading-relaxed">&ldquo;{selectedBooking.message}&rdquo;</p>
                </div>
              )}

              {/* Financial & Payment Details */}
              <div className="rounded-sm border border-line bg-bg p-4">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-orange mb-2">
                  Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Total Payment</span>
                    <span className="font-display text-xl text-cream">
                      ₹5,000
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Advance Paid</span>
                    <span className="font-display text-xl text-teal">
                      ₹{selectedBooking.advanceAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Balance Due</span>
                    <span className="font-display text-xl text-orange">
                      ₹{(5000 - selectedBooking.advanceAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] text-muted uppercase">Status</span>
                    <span className="font-mono text-sm font-semibold uppercase text-teal block mt-1">
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>
                {selectedBooking.razorpayPaymentId && (
                  <div className="mt-3 border-t border-line/60 pt-2 font-mono text-[11px] text-muted">
                    <span>Razorpay Payment ID: </span>
                    <span className="text-cream">{selectedBooking.razorpayPaymentId}</span>
                  </div>
                )}
              </div>

              {/* Cancellation & Refund Information (if cancelled) */}
              {selectedBooking.status === "cancelled" && (
                <div className="rounded-sm border border-orange/40 bg-orange-soft p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase text-orange font-bold">
                      Booking Cancelled
                    </span>
                    <span className={`font-mono text-[10px] uppercase font-bold ${REFUND_STYLE[selectedBooking.refundStatus]}`}>
                      Refund: {selectedBooking.refundStatus.toUpperCase()}
                    </span>
                  </div>
                  {selectedBooking.cancellationMessage && (
                    <p className="text-xs text-cream">
                      Reason: &ldquo;{selectedBooking.cancellationMessage}&rdquo;
                    </p>
                  )}
                  {selectedBooking.cancelledAt && (
                    <p className="font-mono text-[10px] text-muted">
                      Cancelled on: {format(new Date(selectedBooking.cancelledAt), "d MMM yyyy, h:mm a")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 sm:p-5 bg-bg">
              <span className="font-mono text-[11px] text-muted">
                Booking ID: {selectedBooking._id}
              </span>

              <div className="flex items-center gap-2.5">
                {selectedBooking.status !== "confirmed" && selectedBooking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(selectedBooking._id, { status: "confirmed" });
                      setSelectedBooking({ ...selectedBooking, status: "confirmed" });
                    }}
                    className="rounded-sm bg-teal px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg hover:opacity-90 font-semibold"
                  >
                    Confirm Booking
                  </button>
                )}

                {selectedBooking.status !== "declined" && selectedBooking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeclineError("");
                      setDeclineStage(1);
                    }}
                    className="rounded-sm border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted hover:border-orange hover:text-orange transition-colors"
                  >
                    Decline Booking
                  </button>
                )}

                {selectedBooking.refundStatus === "requested" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate(selectedBooking._id, { refundStatus: "approved" });
                        setSelectedBooking({ ...selectedBooking, refundStatus: "approved" });
                      }}
                      className="rounded-sm bg-teal px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg hover:opacity-90 font-semibold"
                    >
                      Approve Refund
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate(selectedBooking._id, { refundStatus: "denied" });
                        setSelectedBooking({ ...selectedBooking, refundStatus: "denied" });
                      }}
                      className="rounded-sm border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-cream"
                    >
                      Deny Refund
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleCloseBooking}
                  className="rounded-sm border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-cream"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* 2-Step Decline Confirmation Modal */}
          {declineStage > 0 && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/85 backdrop-blur-sm"
                onClick={() => {
                  if (!isDecliningProcessing) {
                    setDeclineStage(0);
                    setDeclineError("");
                  }
                }}
              />

              <div className="relative z-10 w-full max-w-lg rounded-sm border border-orange/40 bg-bg-raised p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                {/* Header with Step indicator */}
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange/20 text-xs font-bold text-orange">
                      !
                    </span>
                    <h3 className="font-display text-lg tracking-wide text-cream">
                      {declineStage === 1
                        ? "DECLINE BOOKING (STEP 1 OF 2)"
                        : "FINAL CONFIRMATION (STEP 2 OF 2)"}
                    </h3>
                  </div>
                  <span className="rounded-full bg-orange/15 px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold text-orange border border-orange/30">
                    Step {declineStage} / 2
                  </span>
                </div>

                {/* Body */}
                {declineStage === 1 ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-cream">
                      You are about to decline the booking for{" "}
                      <strong className="text-orange">{selectedBooking.name}</strong> on{" "}
                      <strong>{format(new Date(selectedBooking.eventDate), "d MMMM yyyy")}</strong>.
                    </p>

                    <div className="rounded-sm border border-line bg-bg p-3.5 space-y-2 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted">Advance to Refund:</span>
                        <span className="text-teal font-semibold">
                          ₹{selectedBooking.advanceAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Refund Destination:</span>
                        <span className="text-cream">Original Bank / UPI / Card</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Client Contact:</span>
                        <span className="text-cream">{selectedBooking.phone}</span>
                      </div>
                      {selectedBooking.razorpayPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-muted">Razorpay Payment ID:</span>
                          <span className="text-muted truncate max-w-[200px]">{selectedBooking.razorpayPaymentId}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-sm border border-teal/30 bg-teal/10 p-3 text-xs text-teal">
                      <span className="font-semibold block mb-0.5">Automated Refund Guarantee:</span>
                      The advance payment of ₹{selectedBooking.advanceAmount.toLocaleString("en-IN")} will be automatically credited back via Razorpay directly to the original bank account, UPI ID, or card used during checkout.
                    </div>

                    <p className="text-xs text-muted">
                      Click below to review the final confirmation step before processing.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-sm border border-orange/40 bg-orange/15 p-4 text-xs text-orange space-y-1.5">
                      <span className="font-bold uppercase tracking-wider block text-sm">
                        ⚠️ Second Confirmation Required
                      </span>
                      <p>
                        Are you sure you want to decline this booking? Once confirmed, this action cannot be undone and ₹{selectedBooking.advanceAmount.toLocaleString("en-IN")} will be immediately refunded back to {selectedBooking.name}&apos;s account.
                      </p>
                    </div>

                    {declineError && (
                      <div className="rounded-sm border border-orange/60 bg-orange-soft p-3 font-mono text-xs text-orange">
                        {declineError}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
                  <button
                    type="button"
                    disabled={isDecliningProcessing}
                    onClick={() => {
                      setDeclineStage(0);
                      setDeclineError("");
                    }}
                    className="rounded-sm border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted hover:text-cream disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  {declineStage === 1 ? (
                    <button
                      type="button"
                      onClick={() => setDeclineStage(2)}
                      className="rounded-sm border border-orange bg-orange/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-orange hover:bg-orange hover:text-bg font-semibold transition-colors"
                    >
                      Proceed to Confirm &rarr;
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isDecliningProcessing}
                      onClick={handleExecuteDecline}
                      className="rounded-sm bg-orange px-5 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
                    >
                      {isDecliningProcessing ? (
                        <>
                          <span className="animate-spin">⏳</span> Processing Refund...
                        </>
                      ) : (
                        "Yes, Confirm Decline & Send Refund"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

