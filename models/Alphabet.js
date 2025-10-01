import mongoose from "mongoose";

const alphabetSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Alphabet", alphabetSchema);
