import mongoose from "mongoose";

const otherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // name or description of card
    amount: { type: Number, required: true }, // profit amount
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

const Other = mongoose.model("Other", otherSchema);

export default Other;
