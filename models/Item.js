import mongoose from "mongoose";

const options = { discriminatorKey: "itemType", timestamps: true };

// Base Item Schema
const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    soldPrice: { type: Number, default: null },
    soldDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    owner: {
      type: String,
      enum: ["Owen", "Ben", "Joint"], // restrict to these values
      required: true,
      default: "Joint", // or pick what makes sense
    },
  },
  options
);

const Item = mongoose.model("Item", ItemSchema);

// --- Discriminators ---

// Card
const Card = Item.discriminator(
  "Card",
  new mongoose.Schema(
    {
      set: { type: String, required: true },
      number: { type: String, required: true },
      condition: {
        type: String,
        enum: ["NM", "LP", "MP", "HP", "D"],
        required: true,
      },
    },
    options
  )
);

// Slab
const Slab = Item.discriminator(
  "Slab",
  new mongoose.Schema(
    {
      number: { type: String, required: true },
      set: { type: String, required: true },
      company: {
        type: String,
        enum: ["PSA", "BGS", "CGC", "TAG", "Other"],
        required: true,
      },
      grade: { type: String, required: true },
    },
    options
  )
);

// Sealed
const Sealed = Item.discriminator(
  "Sealed",
  new mongoose.Schema({}, options) // no extra fields beyond base
);

export { Item, Card, Slab, Sealed };
