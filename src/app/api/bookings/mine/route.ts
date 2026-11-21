import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
    try {
        await connectToDatabase();
        const bookings = await Booking.find()
            .sort({ eventDate: -1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Could not load bookings." },
            { status: 500 }
        );
    }
}
