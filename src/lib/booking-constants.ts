export const EVENT_TYPES = [
  "Wedding",
  "Conference / Corporate Event",
  "School Event",
  "College Event",
  "Jagran",
  "Choki",
  "Havan",
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
  Jagran: 1000,
  Choki: 1000,
  Havan: 1000,
};

export const PAYMENT_STATUSES = ["pending", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// A cancellation made at least this many days before the event date gets
// an AUTOMATIC refund — no reason needed. A cancellation made closer to
// the event than this is a "late" cancellation: the customer must give a
// reason, and the studio reviews it before approving/denying the refund.
export const AUTO_REFUND_DAYS_BEFORE = 7;

export const REFUND_STATUSES = [
  "not_applicable",
  "requested",
  "approved",
  "denied",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];