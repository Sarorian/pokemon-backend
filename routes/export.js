// routes/export.js
import express from "express";
import { Item } from "../models/Item.js";
import Expense from "../models/Expense.js";
import Other from "../models/Other.js";
import { stringify } from "csv-stringify";

const router = express.Router();

// ================== TRANSACTIONS ==================
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
    end.setHours(23, 59, 59, 999);

    // 1. Sales
    const soldItems = await Item.find({
      soldDate: { $gte: start, $lte: end },
    }).lean();

    const soldWithProfit = soldItems.map((item) => ({
      ...item,
      purchaseDate: item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().split("T")[0]
        : "",
      soldDate: item.soldDate
        ? new Date(item.soldDate).toISOString().split("T")[0]
        : "",
      profit: +((item.soldPrice || 0) - (item.purchasePrice || 0)).toFixed(2),
      transactionType: "sale",
    }));

    // 2. Purchases
    const purchasedItems = await Item.find({
      purchaseDate: { $gte: start, $lte: end },
    }).lean();

    const purchasesAsTransactions = purchasedItems.map((item) => ({
      ...item,
      purchaseDate: item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().split("T")[0]
        : "",
      soldDate: item.soldDate
        ? new Date(item.soldDate).toISOString().split("T")[0]
        : "",
      profit: -(item.purchasePrice || 0),
      soldPrice: "",
      transactionType: "purchase",
    }));

    // 3. Combine + sort
    const combined = [...soldWithProfit, ...purchasesAsTransactions].sort(
      (a, b) =>
        new Date(a.soldDate || a.purchaseDate) -
        new Date(b.soldDate || b.purchaseDate)
    );

    // 4. CSV headers
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
      "transactionType",
    ];

    const safeStart = start.toISOString().split("T")[0];
    const safeEnd = end.toISOString().split("T")[0];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${safeStart}_to_${safeEnd}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    combined.forEach((row) => stringifier.write(row));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export transactions" });
  }
});

// ================== EXPENSES ==================
router.get("/expenses", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
    }).lean();

    const formatted = expenses.map((e) => ({
      ...e,
      date: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
    }));

    const columns = ["name", "category", "amount", "date", "notes"];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expenses_${startDate}_to_${endDate}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    formatted.forEach((row) => stringifier.write(row));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export expenses" });
  }
});

// ================== OTHER ==================
router.get("/other", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const others = await Other.find({
      date: { $gte: start, $lte: end },
    }).lean();

    const formatted = others.map((o) => ({
      ...o,
      date: o.date ? new Date(o.date).toISOString().split("T")[0] : "",
    }));

    const columns = ["name", "amount", "date", "notes"];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="other_${startDate}_to_${endDate}.csv"`
    );

    const stringifier = stringify({ header: true, columns });
    formatted.forEach((row) => stringifier.write(row));
    stringifier.end();
    stringifier.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export other entries" });
  }
});

export default router;
