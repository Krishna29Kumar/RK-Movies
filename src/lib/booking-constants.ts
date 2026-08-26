export const EVENT_TYPES = [
  "Wedding",
  "Conference / Corporate Event",
  "School Event",
  "College Event",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const BOOKING_STATUSES = ["pending", "confirmed", "declined"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
