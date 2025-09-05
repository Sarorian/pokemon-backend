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
    const savedOther = await other.save();
    res.status(201).json(savedOther);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an entry
router.delete("/:id", async (req, res) => {
  try {
    await Other.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
