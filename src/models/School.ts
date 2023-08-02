import mongoose from "mongoose";
export type SchoolDocument = mongoose.Document & {
    name: string;
    street: string;
    icon: string;
};

const schoolSchema = new mongoose.Schema<SchoolDocument>(
    {
        name: String,
        street: String,
        icon: String
    },
    { timestamps: true },
);
export const School = mongoose.model<SchoolDocument>("School", schoolSchema);
