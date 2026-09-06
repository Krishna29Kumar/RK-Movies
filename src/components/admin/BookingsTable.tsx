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
    onUpdate: (id: string, updates: { status?: AdminBooking["status"] }) => void;
}) {
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
                                            onClick={() => onUpdate(b._id, { status: "declined" })}
                                            className="text-left font-mono text-[10px] uppercase text-muted hover:underline"
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
        </div>
    );
}