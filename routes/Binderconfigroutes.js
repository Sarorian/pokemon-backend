import express from "express";
import BinderConfig from "../models/BinderConfig.js";

const router = express.Router();

// GET current binder count — creates the doc with 0 if it doesn't exist yet
router.get("/", async (req, res) => {
  try {
    let config = await BinderConfig.findOne({ key: "binder" });
    if (!config) {
      config = await BinderConfig.create({ key: "binder", cardCount: 0 });
    }
    res.json({ cardCount: config.cardCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update binder count
router.put("/", async (req, res) => {
  try {
    const { cardCount } = req.body;
    if (cardCount === undefined || isNaN(Number(cardCount))) {
      return res.status(400).json({ error: "cardCount must be a number" });
    }
    const config = await BinderConfig.findOneAndUpdate(
      { key: "binder" },
      { cardCount: Number(cardCount) },
      { new: true, upsert: true },
    );
    res.json({ cardCount: config.cardCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
