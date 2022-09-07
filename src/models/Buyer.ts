import mongoose from "mongoose";
export type BuyerDocument = mongoose.Document & {
    name: string,
    surname: string,
    phone: string,
    email: string,
};

const buyerSchema = new mongoose.Schema<BuyerDocument>(
    {
        name: String,
        surname: String,
        phone: String,
        email: String
    },
    { timestamps: true },

);
export const Buyer = mongoose.model<BuyerDocument>("Buyer", buyerSchema);
