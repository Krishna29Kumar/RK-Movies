import mongoose, { Schema, models, model } from "mongoose";
import {
  EVENT_TYPES,
  BOOKING_STATUSES,
  CAMERA_TYPES,
  SHOOT_TYPES,
  PAYMENT_STATUSES,
  type EventType,
  type BookingStatus,
  type CameraType,
  type ShootType,
  type PaymentStatus,
} from "@/lib/booking-constants";

export { EVENT_TYPES, BOOKING_STATUSES, CAMERA_TYPES, SHOOT_TYPES, PAYMENT_STATUSES };
export type { EventType, BookingStatus, CameraType, ShootType, PaymentStatus };

export interface IBooking {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  eventType: EventType;
  eventDate: Date;
  startTime: string;
  endTime: string;
  durationHours: number;
  address: string;
  cameraCount: number;
  cameraType: CameraType;
  shootType: ShootType;
  message?: string;
  status: BookingStatus;
  advanceAmount: number;
  paymentStatus: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  eventType: { type: String, enum: EVENT_TYPES, required: true },
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  durationHours: { type: Number, required: true, min: 0.5, max: 48 },
  address: { type: String, required: true, trim: true },
  cameraCount: { type: Number, required: true, min: 1, max: 20 },
  cameraType: { type: String, enum: CAMERA_TYPES, required: true },
  shootType: { type: String, enum: SHOOT_TYPES, required: true },
  message: { type: String, trim: true },
  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: "pending",
  },
  advanceAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: PAYMENT_STATUSES,
    default: "pending",
  },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

BookingSchema.index({ eventDate: 1 });

export default models.Booking || model<IBooking>("Booking", BookingSchema);