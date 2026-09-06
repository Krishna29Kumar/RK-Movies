// Shape of a booking as returned by /api/bookings to the admin portal.
export type AdminBooking = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    eventType: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    address: string;
    cameraCount: number;
    cameraType: string;
    shootType: string;
    message?: string;
    status: "pending" | "confirmed" | "declined" | "cancelled";
    advanceAmount: number;
    paymentStatus: "pending" | "paid";
    razorpayPaymentId: string;
    cancelledAt?: string;
    cancellationMessage?: string;
    refundStatus: "not_applicable" | "requested" | "approved" | "denied";
};