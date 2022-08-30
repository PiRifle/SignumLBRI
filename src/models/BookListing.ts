import mongoose from "mongoose";
import { BookOwnerDocument } from "./BookOwner";
import { BookDocument } from "./Book";

export type BookListingDocument = mongoose.Document & {
    commission: number,
    cost: number,
    bookOwner: BookOwnerDocument,
    book: BookDocument,
    sold: boolean,
    created: Date,
    barcode: (id: number) => string;
};
