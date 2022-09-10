import mongoose from "mongoose";
import { BuyerDocument } from "./Buyer";
import { BookDocument } from "./Book";
import { generateEAN13 } from "../util/barcode";
import { UserDocument } from "./User";
// import { stringify } from "querystring";
import paginate from "mongoose-paginate-v2";

export type LabelDocument= mongoose.Document & {
  barcode: string,
  print : boolean,
}
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
    deletedBy: UserDocument,
    // barcode: (id: number) => string;
    status:string,
    label: LabelDocument
};

const labelSchema = new mongoose.Schema<LabelDocument>(
  {
    barcode: String,
    print: Boolean,
  }
);

const bookListingSchema = new mongoose.Schema<BookListingDocument>(
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
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    whenVerified: Date,

    whenSold: Date,

    whenBought: Date,

    label: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },

    status: String,
  },
  { timestamps: true }
);
bookListingSchema.plugin(paginate);

// bookListingSchema.methods.barcode = () => {
// throw "not implemented yet"
export const Label = mongoose.model<LabelDocument>("Label", labelSchema);
// }
export const BookListing = mongoose.model<BookListingDocument, mongoose.PaginateModel<BookListingDocument>>(
  "BookListing",
  bookListingSchema 
);

