import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import otherRoutes from "./routes/otherRoutes.js";
import exportRoutes from "./routes/export.js";
import "dotenv/config";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/other", otherRoutes);
app.use("/api/export", exportRoutes);

// Dynamic port for Heroku, fallback to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
