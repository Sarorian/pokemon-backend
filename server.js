import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import otherRoutes from "./routes/otherRoutes.js";
import exportRoutes from "./routes/export.js";
import "dotenv/config";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://sarorian.github.io",
  }),
);

// Connect to MongoDB (useNewUrlParser / useUnifiedTopology deprecated in Mongoose 6+)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/items", itemRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/other", otherRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
