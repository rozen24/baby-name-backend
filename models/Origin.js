import mongoose from "mongoose";

const originSchema = new mongoose.Schema({
  name: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.model("Origin", originSchema);
