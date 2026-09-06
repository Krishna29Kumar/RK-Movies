import { format } from "date-fns";
import type { AdminBooking } from "@/lib/admin-types";

const REFUND_STYLE: Record<AdminBooking["refundStatus"], string> = {
    not_applicable: "text-muted",
    requested: "text-orange",
    approved: "text-teal",
    denied: "text-muted",
};

const REFUND_LABEL: Record<AdminBooking["refundStatus"], string> = {
    not_applicable: "—",
    requested: "Awaiting your review",
    approved: "Refund approved",
    denied: "Refund denied",
};

export default function RefundsPanel({
    bookings,
    onUpdate,
}: {
    bookings: AdminBooking[];
    onUpdate: (id: string, updates: { refundStatus?: AdminBooking["refundStatus"] }) => void;
}) {
    // Only show bookings that were actually cancelled — that's where a
    // cancellation reason and a refund decision are relevant at all.
    const cancelled = bookings
        .filter((b) => b.status === "cancelled")
        .sort((a, b) => {
            const priority = (status: AdminBooking["refundStatus"]) =>
                status === "requested" ? 0 : 1;
            return priority(a.refundStatus) - priority(b.refundStatus);
        });

    if (cancelled.length === 0) {
        return (
            <p className="text-sm text-muted">No cancellations yet.</p>
        );
    }

    return (
        <div className="space-y-4">
            {cancelled.map((b) => (
                <div key={b._id} className="rounded-sm border border-line-strong bg-bg-raised p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-display text-lg tracking-wide text-cream">
                                {format(new Date(b.eventDate), "d MMMM yyyy")} &middot; {b.eventType}
                            </p>
                            <p className="mt-0.5 text-sm text-muted">
                                {b.name} &middot; {b.email} &middot; {b.phone}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                                Cancelled {b.cancelledAt ? format(new Date(b.cancelledAt), "d MMM yyyy") : ""}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-xs text-cream">
                                Advance paid: ₹{b.advanceAmount}
                            </p>
                            <span className={`font-mono text-[10px] uppercase ${REFUND_STYLE[b.refundStatus]}`}>
                                {REFUND_LABEL[b.refundStatus]}
                            </span>
                        </div>
                    </div>

                    {b.cancellationMessage ? (
                        <div className="mt-3 rounded-sm border border-line bg-bg p-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                                Customer&apos;s reason
                            </p>
                            <p className="mt-1 text-sm text-cream">&ldquo;{b.cancellationMessage}&rdquo;</p>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-muted">
                            No reason given — cancelled a week or more before the event (auto-refund).
                        </p>
                    )}

                    {b.refundStatus === "requested" && (
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => onUpdate(b._id, { refundStatus: "approved" })}
                                className="rounded-sm bg-teal px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bg hover:opacity-90"
                            >
                                Approve refund
                            </button>
                            <button
                                onClick={() => onUpdate(b._id, { refundStatus: "denied" })}
                                className="rounded-sm border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:text-cream"
                            >
                                Deny refund
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}