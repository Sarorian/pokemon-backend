import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import "dotenv/config";

const normalizeDates = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error(err));

  const items = await Item.find({});

  for (const item of items) {
    const fixDate = (dateField) => {
      if (!dateField) return null;
      const date = new Date(dateField);
      if (isNaN(date.getTime())) return null;
      if (date.getFullYear() < 100) {
        date.setFullYear(date.getFullYear() + 2000);
        return date;
      }
      return date;
    };

    const newPurchaseDate = fixDate(item.purchaseDate);
    const newSoldDate = fixDate(item.soldDate);

    const purchaseChanged =
      newPurchaseDate &&
      newPurchaseDate.getTime() !== item.purchaseDate?.getTime();
    const soldChanged =
      newSoldDate && newSoldDate.getTime() !== item.soldDate?.getTime();

    if (purchaseChanged || soldChanged) {
      if (purchaseChanged) item.purchaseDate = newPurchaseDate;
      if (soldChanged) item.soldDate = newSoldDate;
      await item.save();
      console.log(`Updated item: ${item.name}`);
    }
  }

  console.log("✅ Date normalization complete");
  await mongoose.disconnect();
};

normalizeDates().catch(console.error);
