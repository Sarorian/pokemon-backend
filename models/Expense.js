import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String }, // e.g., "Card Show", "Shipping", etc.
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
