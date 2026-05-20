import express from "express";
import Show from "../models/Show.js";

const router = express.Router();

// GET all shows sorted by date desc
router.get("/", async (req, res) => {
  try {
    const shows = await Show.find().sort({ date: -1 });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single show
router.get("/:id", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ error: "Show not found" });
    res.json(show);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create show
router.post("/", async (req, res) => {
  try {
    const show = new Show(req.body);
    const saved = await show.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(400).json({ error: err.message });
  }
});

// PUT update show
router.put("/:id", async (req, res) => {
  try {
    const updated = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Show not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE show
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Show.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Show not found" });
    res.json({ message: "Show deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
