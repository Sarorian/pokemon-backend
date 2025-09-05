// routes/export.js
import express from "express";
import { Item } from "../models/Item.js";
import Expense from "../models/Expense.js";
import Other from "../models/Other.js";
import { stringify } from "csv-stringify";

const router = express.Router();

router.get("/transactions", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full end day

    const items = await Item.find({
      soldDate: { $gte: start, $lte: end },
    }).lean();

    // Add profit calculation
    const itemsWithProfit = items.map((item) => ({
      ...item,
      purchaseDate: item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().split("T")[0]
        : "",
      soldDate: item.soldDate
        ? new Date(item.soldDate).toISOString().split("T")[0]
        : "",
      profit: +((item.soldPrice || 0) - (item.purchasePrice || 0)).toFixed(2),
    }));

    // Define CSV headers
    const columns = [
      "name",
      "purchasePrice",
      "purchaseDate",
      "soldPrice",
      "soldDate",
      "owner",
      "notes",
      "itemType",
      "profit",
    ];

    // Safe filenames for headers (no illegal characters)
    const safeStart = start.toISOString().split("T")[0];
    const safeEnd = end.toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${safeStart}_to_${safeEnd}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    itemsWithProfit.forEach((item) => stringifier.write(item));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export transactions" });
  }
});

// Expenses route
router.get("/expenses", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ error: "startDate and endDate required" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
    }).lean();
    const data = expenses.map((e) => ({
      ...e,
      date: e.date ? e.date.toISOString().split("T")[0] : "",
    }));

    const columns = ["name", "category", "amount", "date", "notes"];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expenses_${startDate}_to_${endDate}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    data.forEach((row) => stringifier.write(row));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export expenses" });
  }
});

// Other route
router.get("/other", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ error: "startDate and endDate required" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const entries = await Other.find({
      date: { $gte: start, $lte: end },
    }).lean();
    const data = entries.map((e) => ({
      ...e,
      date: e.date ? e.date.toISOString().split("T")[0] : "",
    }));

    const columns = ["name", "amount", "date", "notes"];
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="other_${startDate}_to_${endDate}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    data.forEach((row) => stringifier.write(row));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export other profits" });
  }
});

export default router;
