import mongoose from "mongoose";
import _ from "mongoose-paginate-v2";
import {stringify} from "querystring";
export type BookDocument = mongoose.Document & {
  title: string;
  publisher: string;
  authors: string[];
  pubDate: number;
  isbn: number;
  image: string;
  msrp: number;
  getImageLink: ({width, height, quality}?: {width?: number, height?: number, quality?: number}) => string;
};
const bookSchema = new mongoose.Schema<BookDocument>(
  {
    title: { type: String, default: "" },
    publisher: { type: String, default: "" },
    authors: { type: [String], default: [""] },
    pubDate: { type: Number, default: 0 },
    isbn: { type: Number, default: 0 },
    image: { type: String, default: "" },
    msrp: { type: Number, default: 0 },
  },
  { timestamps: true },
);

bookSchema.methods.getImageLink = function(args:any = {}){
  return `/book/${this.id}/image?${stringify(args)}`;
};

export const Book = mongoose.model<BookDocument>("Book", bookSchema);
