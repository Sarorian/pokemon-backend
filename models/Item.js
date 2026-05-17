import mongoose from "mongoose";

const options = { discriminatorKey: "itemType", timestamps: true };

// Base Item Schema
const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: Date, default: null },
    soldPrice: { type: Number, default: null },
    soldDate: { type: Date, default: null },
    notes: { type: String, default: "", trim: true },
    owner: {
      type: String,
      enum: ["Owen", "Ben", "Joint"],
      required: true,
      default: "Joint",
    },
  },
  options,
);

const Item = mongoose.model("Item", ItemSchema);

// Card
const Card = Item.discriminator(
  "Card",
  new mongoose.Schema(
    {
      set: { type: String, required: true, trim: true },
      number: { type: String, required: true, trim: true },
      condition: {
        type: String,
        enum: ["NM", "LP", "MP", "HP", "D"],
        required: true,
      },
    },
    options,
  ),
);

// Slab — company is a free-text field (uppercased before save), not an enum,
// so PSA, BGS, CGC, TAG, SGC, etc. all work without schema changes.
const Slab = Item.discriminator(
  "Slab",
  new mongoose.Schema(
    {
      number: { type: String, required: true, trim: true },
      set: { type: String, required: true, trim: true },
      company: { type: String, required: true, trim: true },
      grade: { type: String, required: true, trim: true },
    },
    options,
  ),
);

// Sealed — no extra fields beyond base
const Sealed = Item.discriminator("Sealed", new mongoose.Schema({}, options));

export { Item, Card, Slab, Sealed };
