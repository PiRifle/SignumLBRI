import mongoose from "mongoose";
import { BookOwner, BookOwnerDocument } from "./BookOwner";
import { BookDocument } from "./Book";
import { generateEAN13 } from "../util/barcode";
export type BookListingDocument = mongoose.Document & {
    commission: number,
    cost: number,
    bookOwner: BookOwnerDocument,
    book: BookDocument,
    sold: boolean,
    created: Date,
    barcode: (id: number) => string;
};

const bookListingSchema = new mongoose.Schema<BookOwnerDocument>(
  {
    _id:{
      type: String,
      default: generateEAN13(13)
    },
    commission: Number,
    cost: Number,
    bookOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookOwner'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    sold: Boolean,
    created: Date,
  },
  { timestamps: true }
);
bookListingSchema.methods.barcode = () => {
throw "not implemented yet"
}
export const BookListing = mongoose.model<BookListingDocument>(
  "BookListing",
  bookListingSchema
);
