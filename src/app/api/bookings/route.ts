import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { EVENT_TYPES } from "@/lib/booking-constants";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const passcode = request.nextUrl.searchParams.get("passcode");

    if (passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await Booking.find().sort({ eventDate: 1 }).lean();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not load bookings." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, eventType, eventDate, location, message } = body;

    if (!name || !email || !phone || !eventType || !eventDate || !location) {
      return NextResponse.json(
        { error: "Please fill in every required field." },
        { status: 400 }
      );
    }

    if (!EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: "That event type isn't recognized." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Booking.findOne({
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "That date is already booked. Please pick another date." },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      name,
      email,
      phone,
      eventType,
      eventDate: parsedDate,
      location,
      message,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not submit your booking. Please try again." },
      { status: 500 }
    );
  }
}
