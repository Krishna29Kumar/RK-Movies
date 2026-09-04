import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const bookings = await Booking.find({ userId: session.user.id })
            .sort({ eventDate: -1 })
            .lean();

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Could not load your bookings." },
            { status: 500 }
        );
    }
}