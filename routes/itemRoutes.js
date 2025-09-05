import express from "express";
import { Item, Card, Slab, Sealed } from "../models/Item.js";

const router = express.Router();

// --- GET all items (optionally filter by type) ---
router.get("/", async (req, res) => {
  try {
    const { type } = req.query; // e.g. /api/items?type=Card
    let items;

    if (type) {
      items = await Item.find({ itemType: type });
    } else {
      items = await Item.find();
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET single item by ID ---
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE new item ---
router.post("/", async (req, res) => {
  try {
    // Helper function to normalize year
    const normalizeYear = (input) => {
      if (!input) return undefined;
      const date = new Date(input);
      if (date.getFullYear() < 100) {
        date.setFullYear(date.getFullYear() + 2000);
      }
      return date;
    };

    // Normalize dates
    if (req.body.purchaseDate)
      req.body.purchaseDate = normalizeYear(req.body.purchaseDate);
    if (req.body.soldDate) req.body.soldDate = normalizeYear(req.body.soldDate);

    let item;
    switch (req.body.itemType) {
      case "Card":
        item = new Card(req.body);
        break;
      case "Slab":
        item = new Slab(req.body);
        break;
      case "Sealed":
        item = new Sealed(req.body);
        break;
      default:
        return res.status(400).json({ error: "Invalid itemType" });
    }

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- UPDATE item ---
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- DELETE item ---
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE all items ---
router.delete("/", async (req, res) => {
  try {
    const result = await Item.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} items.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
