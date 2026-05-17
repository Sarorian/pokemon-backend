import express from "express";
import { Item, Card, Slab, Sealed } from "../models/Item.js";

const router = express.Router();

// Helper: normalize 2-digit years to 4-digit
const normalizeYear = (input) => {
  if (!input) return undefined;
  const date = new Date(input);
  if (isNaN(date.getTime())) return undefined;
  if (date.getFullYear() < 100) date.setFullYear(date.getFullYear() + 2000);
  return date;
};

// GET all items (optionally filter by type)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const items = type
      ? await Item.find({ itemType: type })
      : await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new item
router.post("/", async (req, res) => {
  try {
    const body = { ...req.body };

    // Normalize dates
    if (body.purchaseDate) body.purchaseDate = normalizeYear(body.purchaseDate);
    if (body.soldDate) body.soldDate = normalizeYear(body.soldDate);

    // Uppercase company for Slabs so "psa" and "PSA" both work
    if (body.itemType === "Slab" && body.company) {
      body.company = body.company.trim().toUpperCase();
    }

    let item;
    switch (body.itemType) {
      case "Card":
        item = new Card(body);
        break;
      case "Slab":
        item = new Slab(body);
        break;
      case "Sealed":
        item = new Sealed(body);
        break;
      default:
        return res
          .status(400)
          .json({ error: "Invalid itemType. Must be Card, Slab, or Sealed." });
    }

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    // Return validation errors in a readable format
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT update item (mark as sold, edit notes, etc.)
router.put("/:id", async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.soldDate) body.soldDate = normalizeYear(body.soldDate);
    if (body.purchaseDate) body.purchaseDate = normalizeYear(body.purchaseDate);

    const item = await Item.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE single item
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all items (use with caution!)
router.delete("/", async (req, res) => {
  try {
    const result = await Item.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} items.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
