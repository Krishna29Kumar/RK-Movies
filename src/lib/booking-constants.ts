export const EVENT_TYPES = [
  "Wedding",
  "Conference / Corporate Event",
  "School Event",
  "College Event",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const BOOKING_STATUSES = ["pending", "confirmed", "declined", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const CAMERA_TYPES = [
  "DSLR",
  "Camcorder",
  "Mirrorless",
  "Drone",
] as const;
export type CameraType = (typeof CAMERA_TYPES)[number];

export const SHOOT_TYPES = [
  "Photography only",
  "Videography only",
  "Both photography & videography",
] as const;
export type ShootType = (typeof SHOOT_TYPES)[number];

// A single calendar date can hold this many bookings before it's shown
// as fully booked (the studio can run a few small crews on the same day).
export const MAX_BOOKINGS_PER_DATE = 3;

// Advance payment required to submit a booking request, in rupees.
export const ADVANCE_AMOUNTS: Record<EventType, number> = {
  Wedding: 2000,
  "Conference / Corporate Event": 1000,
  "School Event": 1000,
  "College Event": 1000,
};

export const PAYMENT_STATUSES = ["pending", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// A cancellation made this many days (or fewer) before the event date is
// NOT eligible for a refund of the advance. Cancelling earlier than this
// just flags the booking for the studio to review the refund request.
export const REFUND_ELIGIBLE_DAYS_BEFORE = 4;

export const REFUND_STATUSES = [
  "not_applicable",
  "not_eligible",
  "requested",
  "approved",
  "denied",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];