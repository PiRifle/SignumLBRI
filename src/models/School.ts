import crypto from "crypto";
import mongoose from "mongoose";
export type SchoolDocument = mongoose.Document & {
  name: string;
  longName: string;
  street: string;
  icon: string;
  color: string;
  markup: number;
  getIcon: (host: string) => string;
};

const schoolSchema = new mongoose.Schema<SchoolDocument>(
  {
    name: String,
    longName: String,
    street: String,
    icon: String,
    color: String,
    markup: Number,
  },
  { timestamps: true },
);

schoolSchema.methods.getIcon = function (host: string) {
  if (this.icon) {
    return `${host}/uploads/${this.icon}`;
  } else {
    const md5 = crypto.createHash("md5").update(this.name).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${200}&d=retro`;
  }
};

export const School = mongoose.model<SchoolDocument>("School", schoolSchema);
