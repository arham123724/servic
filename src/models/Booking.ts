import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IBooking extends Document {
  providerId: Types.ObjectId;
  userId: Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: Date;
  timeSlot: string;
  notes?: string;
  status: BookingStatus;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: [true, "Provider ID is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      required: [true, "Client email is required"],
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      required: [true, "Client phone is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    isNew: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BookingSchema.index({ providerId: 1, date: 1 });
BookingSchema.index({ userId: 1 });

// Prevent model overwrite in development with hot reload
const Booking: Model<IBooking> =
  (mongoose.models?.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
