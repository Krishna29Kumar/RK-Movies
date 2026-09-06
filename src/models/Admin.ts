import mongoose, { Schema, models, model } from "mongoose";

export interface IAdmin {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
});

// Separate collection ("admins") from the customer "users" collection.
export default models.Admin || model<IAdmin>("Admin", AdminSchema);