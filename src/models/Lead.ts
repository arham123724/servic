import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type LeadType = "call" | "whatsapp";

export interface ILead extends Document {
  providerId: Types.ObjectId;
  type: LeadType;
  timestamp: Date;
}

const LeadSchema = new Schema<ILead>({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: "Provider",
    required: [true, "Provider ID is required"],
  },
  type: {
    type: String,
    required: [true, "Lead type is required"],
    enum: ["call", "whatsapp"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model overwrite in development with hot reload
const Lead: Model<ILead> =
  (mongoose.models?.Lead as Model<ILead>) || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
