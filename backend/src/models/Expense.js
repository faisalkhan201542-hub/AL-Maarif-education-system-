import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: { 
      type: String, 
      required: true,
      enum: ["Salary", "Electricity", "Maintenance", "Office Supplies", "Rent", "Other"]
    },
    description: { type: String, default: "" },
    recordedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });

export default mongoose.model("Expense", expenseSchema);
