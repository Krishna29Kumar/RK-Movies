import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
    })
      .select("eventDate -_id")
      .lean();

    const bookedDates = bookings.map((b) =>
      new Date(b.eventDate).toISOString().slice(0, 10)
    );

    return NextResponse.json({ bookedDates });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not load availability." },
      { status: 500 }
    );
  }
}
