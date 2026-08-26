import mongoose, { Schema, models, model } from "mongoose";
import { EVENT_TYPES, BOOKING_STATUSES, type EventType, type BookingStatus } from "@/lib/booking-constants";

export { EVENT_TYPES, BOOKING_STATUSES };
export type { EventType, BookingStatus };

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  eventType: EventType;
  eventDate: Date;
  location: string;
  message?: string;
  status: BookingStatus;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  eventType: { type: String, enum: EVENT_TYPES, required: true },
  eventDate: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  message: { type: String, trim: true },
  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: "pending",
  },
  createdAt: { type: Date, default: () => new Date() },
});

// Prevent double-booking the same calendar day at the schema level.
BookingSchema.index({ eventDate: 1 });

export default models.Booking || model<IBooking>("Booking", BookingSchema);
