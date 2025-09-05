import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js"; // updated import
import "dotenv/config";
import expenseRoutes from "./routes/expenseRoutes.js";
import otherRoutes from "./routes/otherRoutes.js";
import exportRoutes from "./routes/export.js";

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
  .catch((err) => console.error(err));

// Routes
app.use("/api/items", itemRoutes); // updated route path
app.use("/api/expenses", expenseRoutes);
app.use("/api/other", otherRoutes);
app.use("/api/export", exportRoutes);

// Start server
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
