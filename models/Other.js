import mongoose from "mongoose";

const otherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

const Other = mongoose.model("Other", otherSchema);

export default Other;
