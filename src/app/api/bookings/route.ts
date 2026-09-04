import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Booking from "@/models/Booking";
import {
  EVENT_TYPES,
  CAMERA_TYPES,
  SHOOT_TYPES,
  ADVANCE_AMOUNTS,
  MAX_BOOKINGS_PER_DATE,
} from "@/lib/booking-constants";

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

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to submit a booking." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      eventType,
      eventDate,
      startTime,
      endTime,
      durationHours,
      address,
      cameraCount,
      cameraType,
      shootType,
      message,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !eventType ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !durationHours ||
      !address ||
      !cameraCount ||
      !cameraType ||
      !shootType ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
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

    if (!CAMERA_TYPES.includes(cameraType)) {
      return NextResponse.json(
        { error: "That camera type isn't recognized." },
        { status: 400 }
      );
    }

    if (!SHOOT_TYPES.includes(shootType)) {
      return NextResponse.json(
        { error: "That shoot type isn't recognized." },
        { status: 400 }
      );
    }

    const cameras = Number(cameraCount);
    if (!Number.isInteger(cameras) || cameras < 1 || cameras > 20) {
      return NextResponse.json(
        { error: "Number of cameras must be between 1 and 20." },
        { status: 400 }
      );
    }

    const duration = Number(durationHours);
    if (!Number.isFinite(duration) || duration <= 0 || duration > 48) {
      return NextResponse.json(
        { error: "Invalid event duration." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(eventDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    // Verify the Razorpay payment signature — this proves the payment
    // actually belongs to this order and wasn't forged client-side.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification failed. Please contact us with your payment ID." },
        { status: 400 }
      );
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // A date can hold a few bookings before it's considered fully booked.
    const existingCount = await Booking.countDocuments({
      eventDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingCount >= MAX_BOOKINGS_PER_DATE) {
      return NextResponse.json(
        {
          error:
            "That date just got fully booked. Your payment succeeded — please contact us with payment ID " +
            razorpayPaymentId +
            " for a refund or to pick another date.",
        },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      userId: session.user.id,
      name,
      email,
      phone,
      eventType,
      eventDate: parsedDate,
      startTime,
      endTime,
      durationHours: duration,
      address,
      cameraCount: cameras,
      cameraType,
      shootType,
      message,
      advanceAmount: ADVANCE_AMOUNTS[eventType as keyof typeof ADVANCE_AMOUNTS],
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
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