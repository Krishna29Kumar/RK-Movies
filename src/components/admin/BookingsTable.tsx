"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";

const STATUS_STYLE: Record<AdminBooking["status"], string> = {
    pending: "text-orange border-orange/40 bg-orange-soft",
    confirmed: "text-teal border-teal/40 bg-teal-soft",
    declined: "text-muted border-line",
    cancelled: "text-muted border-line",
};

export default function BookingsTable({
    bookings,
    onUpdate,
}: {
    bookings: AdminBooking[];
    onUpdate: (
        id: string,
        updates: {
            status?: AdminBooking["status"];
            refundStatus?: AdminBooking["refundStatus"];
        }
    ) => Promise<{ success: boolean; error?: string; booking?: AdminBooking }> | Promise<any> | void;
}) {
    const [bookingToDecline, setBookingToDecline] = useState<AdminBooking | null>(null);
    const [declineStage, setDeclineStage] = useState<0 | 1 | 2>(0);
    const [isDecliningProcessing, setIsDecliningProcessing] = useState(false);
    const [declineError, setDeclineError] = useState("");

    const handleExecuteDecline = async () => {
        if (!bookingToDecline) return;
        setIsDecliningProcessing(true);
        setDeclineError("");
        try {
            const res = await onUpdate(bookingToDecline._id, { status: "declined" });
            if (res && typeof res === "object" && "success" in res && !res.success) {
                setDeclineError(res.error || "Failed to decline and refund. Please try again.");
                setIsDecliningProcessing(false);
                return;
            }
            setBookingToDecline(null);
            setDeclineStage(0);
        } catch (err: any) {
            setDeclineError(err?.message || "An unexpected error occurred while processing refund.");
        } finally {
            setIsDecliningProcessing(false);
        }
    };

    return (
        <div className="overflow-x-auto rounded-sm border border-line">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Timing</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Event</th>
                        <th className="px-4 py-3">Address</th>
                        <th className="px-4 py-3">Cameras</th>
                        <th className="px-4 py-3">Advance</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b._id} className="border-b border-line align-top last:border-0">
                            <td className="px-4 py-3 font-mono text-xs text-cream">
                                {format(new Date(b.eventDate), "d MMM yyyy")}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-muted">
                                {b.startTime}&ndash;{b.endTime}
                                <br />
                                <span className="text-[10px]">{b.durationHours}h</span>
                            </td>
                            <td className="px-4 py-3">
                                <p className="text-cream">{b.name}</p>
                                <p className="text-xs text-muted">{b.email} &middot; {b.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-muted">{b.eventType}</td>
                            <td className="px-4 py-3 text-muted">{b.address}</td>
                            <td className="px-4 py-3 text-muted">
                                {b.cameraCount}&times; {b.cameraType}
                                <br />
                                <span className="text-xs">{b.shootType}</span>
                            </td>
                            <td className="px-4 py-3">
                                <p className="text-cream">₹{b.advanceAmount}</p>
                                <span
                                    className={`font-mono text-[10px] uppercase ${b.paymentStatus === "paid" ? "text-teal" : "text-orange"
                                        }`}
                                >
                                    {b.paymentStatus}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`rounded-sm border px-2 py-1 font-mono text-[10px] uppercase ${STATUS_STYLE[b.status]}`}
                                >
                                    {b.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col gap-1.5">
                                    {b.status !== "confirmed" && b.status !== "cancelled" && (
                                        <button
                                            onClick={() => onUpdate(b._id, { status: "confirmed" })}
                                            className="text-left font-mono text-[10px] uppercase text-teal hover:underline"
                                        >
                                            Confirm
                                        </button>
                                    )}
                                    {b.status !== "declined" && b.status !== "cancelled" && (
                                        <button
                                            onClick={() => {
                                                setBookingToDecline(b);
                                                setDeclineError("");
                                                setDeclineStage(1);
                                            }}
                                            className="text-left font-mono text-[10px] uppercase text-muted hover:text-orange hover:underline transition-colors"
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
                            <td colSpan={9} className="px-4 py-10 text-center text-muted">
                                No bookings yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* 2-Step Decline Confirmation Modal */}
            {declineStage > 0 && bookingToDecline && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
                        onClick={() => {
                            if (!isDecliningProcessing) {
                                setDeclineStage(0);
                                setBookingToDecline(null);
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
                                    <strong className="text-orange">{bookingToDecline.name}</strong> on{" "}
                                    <strong>{format(new Date(bookingToDecline.eventDate), "d MMMM yyyy")}</strong>.
                                </p>

                                <div className="rounded-sm border border-line bg-bg p-3.5 space-y-2 font-mono text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Advance to Refund:</span>
                                        <span className="text-teal font-semibold">
                                            ₹{bookingToDecline.advanceAmount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Refund Destination:</span>
                                        <span className="text-cream">Original Bank / UPI / Card</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Client Contact:</span>
                                        <span className="text-cream">{bookingToDecline.phone}</span>
                                    </div>
                                    {bookingToDecline.razorpayPaymentId && (
                                        <div className="flex justify-between">
                                            <span className="text-muted">Razorpay Payment ID:</span>
                                            <span className="text-muted truncate max-w-[200px]">{bookingToDecline.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-sm border border-teal/30 bg-teal/10 p-3 text-xs text-teal">
                                    <span className="font-semibold block mb-0.5">Automated Refund Guarantee:</span>
                                    The advance payment of ₹{bookingToDecline.advanceAmount.toLocaleString("en-IN")} will be automatically routed back via Razorpay directly to the original bank account, UPI ID, or card used during checkout.
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
                                        Are you sure you want to decline this booking? Once confirmed, this action cannot be undone and ₹{bookingToDecline.advanceAmount.toLocaleString("en-IN")} will be immediately refunded back to {bookingToDecline.name}&apos;s account.
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
                                    setBookingToDecline(null);
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
    );
}
