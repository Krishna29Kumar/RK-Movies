import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getRazorpay } from "@/lib/razorpay";
import {
    EVENT_TYPES,
    ADVANCE_AMOUNTS,
    MAX_BOOKINGS_PER_DATE,
} from "@/lib/booking-constants";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { eventType, eventDate } = await request.json();

        if (!eventType || !eventDate || !EVENT_TYPES.includes(eventType)) {
            return NextResponse.json(
                { error: "Please select a valid event type and date." },
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

        // Check availability BEFORE creating a payment order — no point
        // charging someone for a date that's already fully booked.
        const existingCount = await Booking.countDocuments({
            eventDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["pending", "confirmed"] },
        });

        if (existingCount >= MAX_BOOKINGS_PER_DATE) {
            return NextResponse.json(
                { error: "That date is fully booked. Please pick another date." },
                { status: 409 }
            );
        }

        const amountInRupees = ADVANCE_AMOUNTS[eventType as keyof typeof ADVANCE_AMOUNTS];
        const amountInPaise = amountInRupees * 100;

        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `lensreel_${Date.now()}`,
            notes: { eventType, eventDate },
        });

        return NextResponse.json({
            orderId: order.id,
            amount: amountInPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Could not start the payment. Please try again." },
            { status: 500 }
        );
    }
}