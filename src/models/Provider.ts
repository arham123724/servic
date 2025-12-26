import mongoose, { Schema, Document, Model } from "mongoose";

export const CATEGORIES = [
  "Electrician",
  "Plumber",
  "Tutor",
  "Carpenter",
  "Mechanic",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface IProvider extends Document {
  name: string;
  phone: string;
  email?: string;
  bio?: string;
  category: Category;
  location: string;
  address?: string;
  hourlyRate?: number;
  experience?: number; // years of experience
  services?: string[]; // list of services offered
  workingHours?: {
    start: string; // e.g., "09:00"
    end: string; // e.g., "18:00"
    days: string[]; // e.g., ["Monday", "Tuesday", ...]
  };
  isVerified: boolean;
  rating?: number;
  totalReviews?: number;
  userId?: mongoose.Types.ObjectId; // link to User if they registered
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: CATEGORIES,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    experience: {
      type: Number,
      min: 0,
    },
    services: {
      type: [String],
      default: [],
    },
    workingHours: {
      start: { type: String },
      end: { type: String },
      days: { type: [String], default: [] },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in development with hot reload
const Provider: Model<IProvider> =
  (mongoose.models?.Provider as Model<IProvider>) || mongoose.model<IProvider>("Provider", ProviderSchema);

export default Provider;
