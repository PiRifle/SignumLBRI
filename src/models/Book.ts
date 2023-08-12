import mongoose from "mongoose";
export type BookDocument = mongoose.Document & {
  title: string;
  publisher: string;
  authors: string[];
  pubDate: number;
  isbn: number;
  image: string;
  msrp: number;
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
export const Book = mongoose.model<BookDocument>("Book", bookSchema);
