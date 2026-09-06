import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Booking from "@/models/Booking";
import { AUTO_REFUND_DAYS_BEFORE } from "@/lib/booking-constants";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const message: string | undefined = body?.message?.trim();

        const booking = await Booking.findById(id);

        if (!booking) {
            return NextResponse.json({ error: "Booking not found." }, { status: 404 });
        }

        if (booking.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (booking.status === "cancelled" || booking.status === "declined") {
            return NextResponse.json(
                { error: "This booking is already cancelled." },
                { status: 400 }
            );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDay = new Date(booking.eventDate);
        eventDay.setHours(0, 0, 0, 0);
        const daysUntilEvent = Math.round(
            (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const isEarlyCancellation = daysUntilEvent >= AUTO_REFUND_DAYS_BEFORE;

        // Late cancellation (within a week of the event) needs a reason —
        // it gets sent to the studio for manual review before any refund.
        if (!isEarlyCancellation && !message) {
            return NextResponse.json(
                {
                    error:
                        "This is within a week of your event date. Please add a reason for cancelling — the studio will review it before deciding on a refund.",
                },
                { status: 400 }
            );
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancellationMessage = message;
        // Cancelled a week or more in advance -> refund approved automatically.
        // Cancelled late -> flagged for the studio to review.
        booking.refundStatus = isEarlyCancellation ? "approved" : "requested";
        await booking.save();

        return NextResponse.json({ booking });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Could not cancel the booking. Please try again." },
            { status: 500 }
        );
    }
}