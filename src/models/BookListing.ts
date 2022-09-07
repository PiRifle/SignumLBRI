import mongoose from "mongoose";
import { BuyerDocument } from "./Buyer";
import { BookDocument } from "./Book";
import { generateEAN13 } from "../util/barcode";
import { UserDocument } from "./User";
export type BookListingDocument = mongoose.Document & {
    commission: number,
    cost: number,
    bookOwner: UserDocument,
    book: BookDocument,
    verifiedBy: UserDocument,
    whenVerified: Date,
    soldBy: UserDocument,
    whenSold: Date,
    boughtBy: BuyerDocument,
    whenBought: Date,
    // barcode: (id: number) => string;
    status:string,
    barcode: string
};

const bookListingSchema = new mongoose.Schema<BuyerDocument>(
  {
    _id: {
      type: String,
      default: () => {
        return generateEAN13();
      },
    },
    commission: Number,
    cost: Number,
    bookOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    boughtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    whenVerified: Date,

    whenSold: Date,

    whenBought: Date,

    status: String,
  },
  { timestamps: true }
);
// bookListingSchema.methods.barcode = () => {
// throw "not implemented yet"
// }
export const BookListing = mongoose.model<BookListingDocument>(
  "BookListing",
  bookListingSchema
);
