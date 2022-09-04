import mongoose from "mongoose";
import { BookOwner, BookOwnerDocument } from "./BookOwner";
import { BookDocument } from "./Book";
import { generateEAN13 } from "../util/barcode";
import { UserDocument } from "./User";
export type BookListingDocument = mongoose.Document & {
    commission: number,
    cost: number,
    bookOwner: BookOwnerDocument,
    book: BookDocument,
    putOnSaleBy: UserDocument,
    sold: boolean,
    soldBy: UserDocument,
    created: Date,
    // barcode: (id: number) => string;
    barcode: string
};

const bookListingSchema = new mongoose.Schema<BookOwnerDocument>(
  {
    _id:{
      type: String,
      default: ()=>{return generateEAN13(12)}
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
    putOnSaleBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sold: Boolean,
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function(){
            return this.sold? true : false 
        }
    },
    created: Date,
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
