import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import "dotenv/config";

await mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

async function addOwnerField() {
  try {
    // Update all items that don't have "owner" — defaults to "Joint"
    const result = await Item.updateMany(
      { owner: { $exists: false } },
      { $set: { owner: "Joint" } },
    );
    console.log(`Updated ${result.modifiedCount} items.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

addOwnerField();
