"use client";

import { useEffect, useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import SectionLabel from "@/components/SectionLabel";
import { REFUND_ELIGIBLE_DAYS_BEFORE } from "@/lib/booking-constants";

type Booking = {
    _id: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    address: string;
    cameraCount: number;
    cameraType: string;
    shootType: string;
    status: "pending" | "confirmed" | "declined" | "cancelled";
    advanceAmount: number;
    paymentStatus: "pending" | "paid";
    cancellationMessage?: string;
    refundStatus: "not_applicable" | "not_eligible" | "requested" | "approved" | "denied";
};

const REFUND_LABEL: Record<Booking["refundStatus"], string> = {
    not_applicable: "",
    not_eligible: "Advance not refunded (cancelled too close to the date)",
    requested: "Refund requested — awaiting studio review",
    approved: "Refund approved",
    denied: "Refund request denied",
};

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelingId, setCancelingId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/bookings/mine")
            .then((res) => res.json())
            .then((data) => {
                if (data.bookings) setBookings(data.bookings);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleCancelled(updated: Booking) {
        setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        setCancelingId(null);
    }

    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const pending = bookings.filter((b) => b.status === "pending");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const declined = bookings.filter((b) => b.status === "declined");

    return (
        <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-orange">
                Your bookings
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-wide text-cream sm:text-4xl">
                MY BOOKINGS
            </h1>

            {loading ? (
                <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    Loading…
                </p>
            ) : bookings.length === 0 ? (
                <p className="mt-6 text-sm text-muted">
                    You haven&apos;t requested a booking yet.
                </p>
            ) : (
                <div className="mt-8 space-y-10">
                    <BookingGroup
                        title="Confirmed"
                        bookings={confirmed}
                        emptyText="No confirmed bookings yet."
                        cancelingId={cancelingId}
                        setCancelingId={setCancelingId}
                        onCancelled={handleCancelled}
                    />
                    <BookingGroup
                        title="Unconfirmed (awaiting studio confirmation)"
                        bookings={pending}
                        emptyText="Nothing pending."
                        cancelingId={cancelingId}
                        setCancelingId={setCancelingId}
                        onCancelled={handleCancelled}
                    />
                    <BookingGroup
                        title="Cancelled"
                        bookings={cancelled}
                        emptyText="No cancelled bookings."
                        cancelingId={cancelingId}
                        setCancelingId={setCancelingId}
                        onCancelled={handleCancelled}
                    />
                    {declined.length > 0 && (
                        <BookingGroup
                            title="Declined by studio"
                            bookings={declined}
                            emptyText=""
                            cancelingId={cancelingId}
                            setCancelingId={setCancelingId}
                            onCancelled={handleCancelled}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function BookingGroup({
    title,
    bookings,
    emptyText,
    cancelingId,
    setCancelingId,
    onCancelled,
}: {
    title: string;
    bookings: Booking[];
    emptyText: string;
    cancelingId: string | null;
    setCancelingId: (id: string | null) => void;
    onCancelled: (b: Booking) => void;
}) {
    return (
        <div>
            <SectionLabel>{title}</SectionLabel>
            {bookings.length === 0 ? (
                <p className="mt-4 text-sm text-muted">{emptyText}</p>
            ) : (
                <div className="mt-4 space-y-4">
                    {bookings.map((b) => (
                        <BookingCard
                            key={b._id}
                            booking={b}
                            isCanceling={cancelingId === b._id}
                            onStartCancel={() => setCancelingId(b._id)}
                            onCloseCancel={() => setCancelingId(null)}
                            onCancelled={onCancelled}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function BookingCard({
    booking,
    isCanceling,
    onStartCancel,
    onCloseCancel,
    onCancelled,
}: {
    booking: Booking;
    isCanceling: boolean;
    onStartCancel: () => void;
    onCloseCancel: () => void;
    onCancelled: (b: Booking) => void;
}) {
    const canCancel = booking.status === "pending" || booking.status === "confirmed";
    const daysUntil = differenceInCalendarDays(new Date(booking.eventDate), new Date());
    const eligibleForRefundRequest = daysUntil >= REFUND_ELIGIBLE_DAYS_BEFORE;

    return (
        <div className="rounded-sm border border-line-strong bg-bg-raised p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-display text-lg tracking-wide text-cream">
                        {format(new Date(booking.eventDate), "d MMMM yyyy")}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                        {booking.eventType} &middot; {booking.startTime}&ndash;{booking.endTime} ({booking.durationHours}h)
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{booking.address}</p>
                    <p className="mt-0.5 text-xs text-muted">
                        {booking.cameraCount}&times; {booking.cameraType} &middot; {booking.shootType}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-xs text-cream">
                        Advance: ₹{booking.advanceAmount}
                    </p>
                    <p className="font-mono text-[10px] uppercase text-teal">
                        {booking.paymentStatus}
                    </p>
                </div>
            </div>

            {booking.status === "cancelled" && (
                <div className="mt-3 border-t border-line pt-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-orange">
                        {REFUND_LABEL[booking.refundStatus]}
                    </p>
                    {booking.cancellationMessage && (
                        <p className="mt-1 text-xs text-muted">
                            Your message: &ldquo;{booking.cancellationMessage}&rdquo;
                        </p>
                    )}
                </div>
            )}

            {canCancel && !isCanceling && (
                <button
                    onClick={onStartCancel}
                    className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-orange hover:underline"
                >
                    Cancel booking
                </button>
            )}

            {canCancel && isCanceling && (
                <CancelPanel
                    bookingId={booking._id}
                    eligibleForRefundRequest={eligibleForRefundRequest}
                    onClose={onCloseCancel}
                    onCancelled={onCancelled}
                />
            )}
        </div>
    );
}

function CancelPanel({
    bookingId,
    eligibleForRefundRequest,
    onClose,
    onCancelled,
}: {
    bookingId: string;
    eligibleForRefundRequest: boolean;
    onClose: () => void;
    onCancelled: (b: Booking) => void;
}) {
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function submit() {
        if (eligibleForRefundRequest && !message.trim()) {
            setError("Please add a short message so the studio can review your refund request.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message.trim() || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not cancel this booking.");
                return;
            }
            onCancelled(data.booking);
        } catch {
            setError("Could not reach the server.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
            {eligibleForRefundRequest ? (
                <>
                    <p className="text-xs text-muted">
                        You&apos;re cancelling {REFUND_ELIGIBLE_DAYS_BEFORE}+ days before the event —
                        add a short message and the studio will consider refunding your advance.
                    </p>
                    <textarea
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="input resize-none"
                        placeholder="Why are you cancelling?"
                    />
                </>
            ) : (
                <p className="text-xs text-orange">
                    This is within {REFUND_ELIGIBLE_DAYS_BEFORE} days of your event date, so the
                    advance payment will not be refunded. Cancel anyway?
                </p>
            )}

            {error && (
                <p className="rounded-sm border border-orange/40 bg-orange-soft px-3 py-2 font-mono text-xs text-orange">
                    {error}
                </p>
            )}

            <div className="flex gap-3">
                <button
                    onClick={submit}
                    disabled={submitting}
                    className="rounded-sm bg-orange px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bg disabled:opacity-50"
                >
                    {submitting
                        ? "Cancelling…"
                        : eligibleForRefundRequest
                            ? "Request cancellation & refund"
                            : "Confirm cancellation"}
                </button>
                <button
                    onClick={onClose}
                    disabled={submitting}
                    className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:text-cream"
                >
                    Never mind
                </button>
            </div>
        </div>
    );
}