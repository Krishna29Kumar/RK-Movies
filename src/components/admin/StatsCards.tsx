import type { AdminBooking } from "@/lib/admin-types";

export default function StatsCards({ bookings }: { bookings: AdminBooking[] }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // All the money math happens right here — plain array math, no magic.
    const totalCollected = bookings
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + b.advanceAmount, 0);

    const totalRefunded = bookings
        .filter((b) => b.refundStatus === "approved")
        .reduce((sum, b) => sum + b.advanceAmount, 0);

    const netRetained = totalCollected - totalRefunded;

    const upcomingCount = bookings.filter(
        (b) =>
            new Date(b.eventDate) >= today &&
            (b.status === "pending" || b.status === "confirmed")
    ).length;

    const pendingConfirmations = bookings.filter((b) => b.status === "pending").length;
    const pendingRefunds = bookings.filter((b) => b.refundStatus === "requested").length;

    const cards = [
        { label: "Advance collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, accent: "text-teal" },
        { label: "Refunded so far", value: `₹${totalRefunded.toLocaleString("en-IN")}`, accent: "text-orange" },
        { label: "Net retained", value: `₹${netRetained.toLocaleString("en-IN")}`, accent: "text-cream" },
        { label: "Upcoming bookings", value: upcomingCount, accent: "text-cream" },
        { label: "Awaiting confirmation", value: pendingConfirmations, accent: "text-orange" },
        { label: "Refund requests to review", value: pendingRefunds, accent: "text-orange" },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {cards.map((card) => (
                <div key={card.label} className="rounded-sm border border-line bg-bg-raised p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                        {card.label}
                    </p>
                    <p className={`mt-1 font-display text-2xl tracking-wide ${card.accent}`}>
                        {card.value}
                    </p>
                </div>
            ))}
        </div>
    );
}