import mongoose from "mongoose";
import { UserDocument } from "./User";
export type PerformanceDocument = mongoose.Document & {
  user: UserDocument;
  from: string;
  to: string;
  time: number;
};

const performanceSchema = new mongoose.Schema<PerformanceDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    from: String,
    to: String,
    time: Number,
  },
  { timestamps: true },
);
export const UserPerformance = mongoose.model<PerformanceDocument>(
  "Performance",
  performanceSchema,
);
