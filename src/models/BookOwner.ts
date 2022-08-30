import mongoose from "mongoose";
export type BookOwnerDocument = mongoose.Document & {
    name: string,
    surname: string,
    phone: string,
    email: string,
};

const bookOwnerSchema = new mongoose.Schema<BookOwnerDocument>(
    {
        name: String,
        surname: String,
        phone: String,
        email: String
    },
    { timestamps: true },

)
export const BookOwner = mongoose.model<BookOwnerDocument>("BookOwner", bookOwnerSchema);
