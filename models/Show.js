import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, trim: true, default: "" },
    tableFee: { type: Number, default: 0 },
    travelCost: { type: Number, default: 0 },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

const Show = mongoose.model("Show", showSchema);
export default Show;
