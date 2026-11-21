"use client";

import { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";

interface MonthStats {
  datesBooked: number;
  dateCancelledRequest: number;
  inReview: number;
  approved: number;
  advanceCollected: number;
  refunded: number;
  balance: number;
}

function computeMonthStats(
  bookings: AdminBooking[],
  year: number,
  month: number
): MonthStats {
  const isInMonth = (dateStr?: string | Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year;
  };

  // 1. Total Dates Booked: active bookings placed for or scheduled in this month
  const monthBookings = bookings.filter((b) => {
    return isInMonth(b.eventDate) || isInMonth(b.createdAt);
  });

  const datesBooked = monthBookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "declined"
  ).length;

  // 2. Date cancelled request: cancellations belonging to this month
  const cancelledBookings = bookings.filter((b) => {
    if (b.status !== "cancelled") return false;
    return isInMonth(b.cancelledAt) || isInMonth(b.eventDate);
  });
  const dateCancelledRequest = cancelledBookings.length;

  // 3. In review: cancellations/refunds awaiting review for this month
  const inReview = cancelledBookings.filter((b) => b.refundStatus === "requested").length;

  // 4. Approved: cancellations/refunds approved for this month
  const approved = cancelledBookings.filter((b) => b.refundStatus === "approved").length;

  // 5. Advance collected: advance collected for bookings belonging to this month
  const advanceCollected = monthBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.advanceAmount || 0), 0);

  // 6. Refunded: total refunded on approved cancellations for this month
  const refunded = cancelledBookings
    .filter((b) => b.refundStatus === "approved")
    .reduce((sum, b) => sum + (b.advanceAmount || 0), 0);

  // 7. Balance: net retained balance for this month
  const balance = advanceCollected - refunded;

  return {
    datesBooked,
    dateCancelledRequest,
    inReview,
    approved,
    advanceCollected,
    refunded,
    balance,
  };
}

function renderStatsRow(stats: MonthStats, isCurrent: boolean, monthName: string) {
  const cards = [
    {
      label: isCurrent ? "Total Dates Booked this month" : `Total Dates Booked (${monthName})`,
      value: stats.datesBooked,
      accent: "text-cream",
    },
    {
      label: "Date cancelled request",
      value: stats.dateCancelledRequest,
      accent: "text-orange",
    },
    {
      label: "In review",
      value: stats.inReview,
      accent: "text-orange",
    },
    {
      label: "Approved",
      value: stats.approved,
      accent: "text-teal",
    },
    {
      label: "Advance collected",
      value: `₹${stats.advanceCollected.toLocaleString("en-IN")}`,
      accent: "text-teal",
    },
    {
      label: "Refunded",
      value: `₹${stats.refunded.toLocaleString("en-IN")}`,
      accent: "text-orange",
    },
    {
      label: "Balance",
      value: `₹${stats.balance.toLocaleString("en-IN")}`,
      accent: "text-cream",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col justify-between rounded-sm border border-line bg-bg-raised p-3.5 sm:p-4"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted sm:text-[10px]">
            {card.label}
          </p>
          <p className={`mt-1.5 font-display text-xl tracking-wide sm:text-2xl ${card.accent}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function StatsCards({
  bookings,
  activeMonth,
  onMonthChange,
}: {
  bookings: AdminBooking[];
  activeMonth: Date;
  onMonthChange: (month: Date) => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const selectedYear = activeMonth.getFullYear();
  const selectedMonth = activeMonth.getMonth();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;
  const selectedMonthName = format(activeMonth, "MMMM yyyy");

  // Generate list of previous months with data or past months
  const pastMonths = useMemo(() => {
    const list: { year: number; month: number; label: string }[] = [];
    const seen = new Set<string>();

    // Scan backwards from 1 month before current month for history
    for (let i = 1; i <= 12; i++) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${m}`;
      seen.add(key);
      list.push({ year: y, month: m, label: format(d, "MMMM yyyy") });
    }

    // Also include any older months from bookings
    bookings.forEach((b) => {
      [b.eventDate, b.createdAt, b.cancelledAt].forEach((dt) => {
        if (!dt) return;
        const d = new Date(dt);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = d.getMonth();
          const key = `${y}-${m}`;
          if (!seen.has(key) && (y < currentYear || (y === currentYear && m < currentMonth))) {
            seen.add(key);
            list.push({ year: y, month: m, label: format(d, "MMMM yyyy") });
          }
        }
      });
    });

    return list.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [bookings, currentYear, currentMonth]);

  // Navigate months
  const goToPrevMonth = () => {
    onMonthChange(subMonths(activeMonth, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(addMonths(activeMonth, 1));
  };

  const resetToCurrent = () => {
    onMonthChange(startOfMonth(new Date()));
  };

  const currentStats = computeMonthStats(bookings, selectedYear, selectedMonth);

  return (
    <div className="space-y-3">
      {/* Top Header of the Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-sm border border-line bg-bg-raised px-2.5 py-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="text-muted hover:text-cream font-mono text-xs px-1"
              title="Previous month"
            >
              &larr;
            </button>
            <span className="font-mono text-xs font-medium text-cream">
              {selectedMonthName}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className={`font-mono text-xs px-1 ${
                isCurrentMonth ? "text-muted/30 cursor-not-allowed" : "text-muted hover:text-cream"
              }`}
              title="Next month"
            >
              &rarr;
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={resetToCurrent}
              className="font-mono text-[10px] uppercase text-orange hover:underline ml-1"
            >
              Reset to Current
            </button>
          )}
        </div>

        {/* Top Right History Button */}
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-1.5 rounded-sm border border-orange bg-orange/10 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-orange transition-all hover:bg-orange hover:text-bg shadow-sm"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          History
        </button>
      </div>

      {/* The 7-Card Bar for the selected month */}
      {renderStatsRow(currentStats, isCurrentMonth, selectedMonthName)}

      {/* Monthly History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-bg/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowHistoryModal(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col rounded-sm border border-line-strong bg-bg-raised shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line p-5 sm:p-6">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-cream">
                  MONTHLY HISTORY
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Past months&apos; bookings, cancellations, advances, and net balances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-sm border border-line p-2 text-muted hover:border-line-strong hover:text-cream"
                aria-label="Close modal"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Scrollable list of previous months */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {pastMonths.map(({ year, month, label }) => {
                const monthStat = computeMonthStats(bookings, year, month);

                return (
                  <div
                    key={`${year}-${month}`}
                    className="rounded-sm border border-line bg-bg p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-line/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg tracking-wide text-cream">
                          {label.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] text-muted uppercase">
                          ({year})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onMonthChange(new Date(year, month, 1));
                          setShowHistoryModal(false);
                        }}
                        className="font-mono text-xs text-orange hover:underline"
                      >
                        View on dashboard &rarr;
                      </button>
                    </div>

                    {/* Exact same 7-card bar for this past month */}
                    {renderStatsRow(monthStat, false, label)}
                  </div>
                );
              })}

              {pastMonths.length === 0 && (
                <p className="py-12 text-center text-sm text-muted">
                  No previous months on record yet.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-line p-4">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-sm bg-orange px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-bg hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
