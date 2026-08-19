import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, index: true },
    profilePicture: { type: String, default: null },
    passwordHash: { type: String, required: true, select: false },
    resetCodeHash: { type: String, default: null, select: false },
    resetCodeExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true, versionKey: false },
);
export const User = mongoose.model("User", userSchema);
