import crypto from "crypto";
import mongoose from "mongoose";
import { stringify } from "querystring";

export type SchoolDocument = mongoose.Document & {
  name: string;
  longName: string;
  street: string;
  icon: string;
  color: string;
  markup: number;
  getIcon: ({width, height, quality}: {width?: number, height?: number, quality?: number}) => string;
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

schoolSchema.methods.getIcon = function (args:any) {
  if (this.icon) {
    return `/school/${this.id}/logo?${stringify(args)}`
  } else {
    const md5 = crypto.createHash("md5").update(this.name).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${args.width || args.height || 200}&d=retro`;
  }
};

export const School = mongoose.model<SchoolDocument>("School", schoolSchema);
