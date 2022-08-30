import mongoose from "mongoose";
export type BookDocument = mongoose.Document & {
    title: string,
    publisher: string,
    authors: string[],
    pubDate: number,
    isbn: number,
    image: string,
    msrp: number,
};
const bookSchema = new mongoose.Schema<BookDocument>(
    {
        title: String,
        publisher: String,
        authors: [String],
        pubDate: Number,
        isbn: Number,
        image: String,
        msrp: Number
    },
    { timestamps: true },
);
export const Book = mongoose.model<BookDocument>("Book", bookSchema);
