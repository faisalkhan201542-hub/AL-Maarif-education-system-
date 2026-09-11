import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    month: { type: String, required: true }, // Format: YYYY-MM
    baseSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paymentDate: { type: Date },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

payrollSchema.index({ teacher: 1, month: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);
