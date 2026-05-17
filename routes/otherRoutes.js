import express from "express";
import Other from "../models/Other.js";

const router = express.Router();

// GET all other profits
router.get("/", async (req, res) => {
  try {
    const others = await Other.find().sort({ date: -1 });
    res.json(others);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new other profit
router.post("/", async (req, res) => {
  try {
    const other = new Other(req.body);
    const saved = await other.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT update other profit entry
router.put("/:id", async (req, res) => {
  try {
    const updated = await Other.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an entry
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Other.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
