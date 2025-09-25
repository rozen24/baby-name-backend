import mongoose from "mongoose";

const nameSchema = new mongoose.Schema({
  babyName: { type: String, required: true },
  gender: { type: String, enum: ["Boy", "Girl", "Unisex"], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: "Origin" },
  meaning: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Name", nameSchema);
