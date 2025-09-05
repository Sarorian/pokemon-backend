import mongoose from "mongoose";
import { Item } from "../models/Item.js";
import "dotenv/config";

const normalizeDates = async () => {
  await mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error(err));

  const items = await Item.find({});

  for (const item of items) {
    let updated = false;

    const fixDate = (dateField) => {
      if (!dateField) return null;

      let date = new Date(dateField);

      if (isNaN(date.getTime())) return null; // invalid date

      if (date.getFullYear() < 100) {
        date.setFullYear(date.getFullYear() + 2000);
        return date;
      }

      return date; // already correct
    };

    const newPurchaseDate = fixDate(item.purchaseDate);
    const newSoldDate = fixDate(item.soldDate);

    if (
      (newPurchaseDate &&
        newPurchaseDate.getTime() !== item.purchaseDate?.getTime()) ||
      (newSoldDate && newSoldDate.getTime() !== item.soldDate?.getTime())
    ) {
      item.purchaseDate = newPurchaseDate || item.purchaseDate;
      item.soldDate = newSoldDate || item.soldDate;
      await item.save();
      console.log(`Updated item: ${item.name}`);
    }
  }

  console.log("✅ Date normalization complete");
  await mongoose.disconnect();
};

normalizeDates().catch(console.error);
