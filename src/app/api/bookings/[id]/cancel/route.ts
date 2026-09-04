import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Booking from "@/models/Booking";
import { REFUND_ELIGIBLE_DAYS_BEFORE } from "@/lib/booking-constants";

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

        const eligibleForRefundRequest = daysUntilEvent >= REFUND_ELIGIBLE_DAYS_BEFORE;

        if (eligibleForRefundRequest && !message) {
            return NextResponse.json(
                {
                    error:
                        "Please add a short message explaining why you're cancelling — the studio will review it for a refund.",
                },
                { status: 400 }
            );
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        booking.cancellationMessage = message;
        booking.refundStatus = eligibleForRefundRequest ? "requested" : "not_eligible";
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