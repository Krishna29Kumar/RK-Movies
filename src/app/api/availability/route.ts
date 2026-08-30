import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { MAX_BOOKINGS_PER_DATE } from "@/lib/booking-constants";

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
    })
      .select("eventDate -_id")
      .lean();

    // Count bookings per date, only mark a date "full" once it hits the cap
    // — the studio can run 2-3 smaller bookings on the same day.
    const counts = new Map<string, number>();
    for (const b of bookings) {
      const key = new Date(b.eventDate).toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const bookedDates = Array.from(counts.entries())
      .filter(([, count]) => count >= MAX_BOOKINGS_PER_DATE)
      .map(([date]) => date);

    return NextResponse.json({ bookedDates });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not load availability." },
      { status: 500 }
    );
  }
}