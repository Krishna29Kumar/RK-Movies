import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/admin-auth";
import Booking from "@/models/Booking";
import { getRazorpay } from "@/lib/razorpay";
import { BOOKING_STATUSES, REFUND_STATUSES } from "@/lib/booking-constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status, refundStatus } = body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const update: Record<string, any> = {};

    const isDeclining = status === "declined" && booking.status !== "declined";
    const isApprovingRefund = refundStatus === "approved" && booking.refundStatus !== "approved";

    // When declining a booking or approving a refund request, auto-refund via Razorpay
    // to the original payment source (bank / UPI / card).
    if (isDeclining || isApprovingRefund) {
      if (booking.paymentStatus === "paid" && booking.razorpayPaymentId) {
        if (booking.refundStatus !== "approved" && !booking.razorpayRefundId) {
          try {
            const razorpay = getRazorpay();
            const refundAmountInPaise = Math.round((booking.advanceAmount || 0) * 100);

            if (refundAmountInPaise > 0) {
              const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
                amount: refundAmountInPaise,
                speed: "normal",
                notes: {
                  reason: isDeclining
                    ? "Booking declined by administrator - Advance auto-refunded to source"
                    : "Refund request approved by administrator",
                  bookingId: booking._id.toString(),
                  clientName: booking.name,
                  clientPhone: booking.phone,
                  clientEmail: booking.email,
                },
              });

              console.log("Razorpay refund processed successfully:", refund.id);
              update.razorpayRefundId = refund.id;
            }
            update.refundStatus = "approved";
          } catch (refundError: any) {
            console.error("Razorpay refund error:", refundError);
            const errorDesc =
              refundError?.error?.description ||
              refundError?.description ||
              refundError?.message ||
              "";

            // If it was already refunded on Razorpay, proceed cleanly
            if (errorDesc.toLowerCase().includes("already been refunded")) {
              update.refundStatus = "approved";
            } else {
              return NextResponse.json(
                {
                  error: `Razorpay refund failed: ${errorDesc || "Payment gateway error"}. Booking decline was cancelled.`,
                },
                { status: 400 }
              );
            }
          }
        }
      }

      if (isDeclining) {
        update.status = "declined";
        update.refundStatus = "approved";
        if (!booking.cancelledAt) {
          update.cancelledAt = new Date();
        }
        update.cancellationMessage =
          "Booking declined by administrator. Advance payment has been automatically refunded to the original payment method.";
      }
    }

    if (status !== undefined && !isDeclining) {
      if (!BOOKING_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = status;
    }

    if (refundStatus !== undefined && !isApprovingRefund && !isDeclining) {
      if (!REFUND_STATUSES.includes(refundStatus)) {
        return NextResponse.json({ error: "Invalid refund status." }, { status: 400 });
      }
      update.refundStatus = refundStatus;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    });
    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("Update booking API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update the booking." },
      { status: 500 }
    );
  }
}
