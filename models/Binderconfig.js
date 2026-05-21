import mongoose from "mongoose";

const binderConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "binder", unique: true },
    cardCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const BinderConfig = mongoose.model("BinderConfig", binderConfigSchema);
export default BinderConfig;
