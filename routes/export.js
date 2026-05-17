import express from "express";
import { Item } from "../models/Item.js";
import Expense from "../models/Expense.js";
import Other from "../models/Other.js";
import { stringify } from "csv-stringify";

const router = express.Router();

// ================== SESSION SUMMARY ==================
// Returns JSON summary for the export page UI
router.get("/summary", async (req, res) => {
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

    // Sold items in range
    const soldItems = await Item.find({
      soldDate: { $gte: start, $lte: end },
      soldPrice: { $ne: null },
    }).lean();

    // Other profits in range
    const otherEntries = await Other.find({
      date: { $gte: start, $lte: end },
    }).lean();

    // Build per-item rows
    const itemRows = soldItems.map((item) => ({
      name: item.name,
      itemType: item.itemType,
      owner: item.owner || "",
      purchasePrice: Number(item.purchasePrice) || 0,
      soldPrice: Number(item.soldPrice) || 0,
      profit: (Number(item.soldPrice) || 0) - (Number(item.purchasePrice) || 0),
      paymentMethod: item.paymentMethod || "Cash",
      soldDate: item.soldDate
        ? new Date(item.soldDate).toISOString().split("T")[0]
        : "",
    }));

    const otherRows = otherEntries.map((o) => ({
      name: o.name,
      amount: Number(o.amount) || 0,
      date: o.date ? new Date(o.date).toISOString().split("T")[0] : "",
      notes: o.notes || "",
    }));

    // Totals
    const totalMoneyIn =
      itemRows.reduce((s, r) => s + r.soldPrice, 0) +
      otherRows.reduce((s, r) => s + r.amount, 0);

    const totalProfit =
      itemRows.reduce((s, r) => s + r.profit, 0) +
      otherRows.reduce((s, r) => s + r.amount, 0);

    const digitalBen = itemRows
      .filter((r) => r.paymentMethod === "Digital - Ben")
      .reduce((s, r) => s + r.soldPrice, 0);

    const digitalOwen = itemRows
      .filter((r) => r.paymentMethod === "Digital - Owen")
      .reduce((s, r) => s + r.soldPrice, 0);

    const totalDigital = digitalBen + digitalOwen;
    const totalCash = totalMoneyIn - totalDigital;

    res.json({
      totalMoneyIn,
      totalProfit,
      totalCash,
      totalDigital,
      digitalBen,
      digitalOwen,
      itemCount: itemRows.length,
      otherCount: otherRows.length,
      items: itemRows,
      other: otherRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ================== TRANSACTIONS CSV ==================
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

    const combined = [...soldWithProfit, ...purchasesAsTransactions].sort(
      (a, b) =>
        new Date(a.soldDate || a.purchaseDate) -
        new Date(b.soldDate || b.purchaseDate),
    );

    const columns = [
      "name",
      "purchasePrice",
      "purchaseDate",
      "soldPrice",
      "soldDate",
      "paymentMethod",
      "owner",
      "notes",
      "itemType",
      "profit",
      "transactionType",
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transactions_${startDate}_to_${endDate}.csv"`,
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

// ================== EXPENSES CSV ==================
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
      `attachment; filename="expenses_${startDate}_to_${endDate}.csv"`,
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

// ================== OTHER CSV ==================
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
      `attachment; filename="other_${startDate}_to_${endDate}.csv"`,
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
