import mongoose from "mongoose";
import { Item } from "../models/Item.js"; // <-- named import
import "dotenv/config";

// connect to your database
await mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

async function addOwnerField() {
  try {
    // Update all items that don't have "owner"
    const result = await Item.updateMany(
      { owner: { $exists: false } },
      { $set: { owner: "Owen" } } // default to Joint
    );

    console.log(`Updated ${result.modifiedCount} items.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

addOwnerField();
