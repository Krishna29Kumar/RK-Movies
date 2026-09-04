import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { BOOKING_STATUSES, REFUND_STATUSES } from "@/lib/booking-constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status, refundStatus, passcode } = body;

    if (passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: { status?: string; refundStatus?: string } = {};

    if (status !== undefined) {
      if (!BOOKING_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = status;
    }

    if (refundStatus !== undefined) {
      if (!REFUND_STATUSES.includes(refundStatus)) {
        return NextResponse.json({ error: "Invalid refund status." }, { status: 400 });
      }
      update.refundStatus = refundStatus;
    }

    const booking = await Booking.findByIdAndUpdate(id, update, { new: true });

    if (!booking) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not update the booking." },
      { status: 500 }
    );
  }
}