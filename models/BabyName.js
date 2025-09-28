import mongoose from "mongoose";

const GENDERS = {
  boy: "ছেলে",
  girl: "মেয়ে",
};

const babyNameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ✅ Embed gender directly
  gender: {
    type: String,
    enum: Object.keys(GENDERS) // ["boy", "girl"]
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: "Origin" },
  meaning: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Ensure virtuals show up in JSON responses
babyNameSchema.set("toJSON", { virtuals: true });
babyNameSchema.set("toObject", { virtuals: true });

export default mongoose.model("BabyName", babyNameSchema);
