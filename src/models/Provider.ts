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
  bio?: string;
  category: Category;
  location: string;
  isVerified: boolean;
  createdAt: Date;
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
    isVerified: {
      type: Boolean,
      default: false,
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
