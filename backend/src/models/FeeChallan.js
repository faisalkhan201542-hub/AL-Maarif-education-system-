import mongoose from "mongoose";
import { CHALLAN_TYPES, CLASSES, FEE_STATUS, VERIFICATION_STATUS } from "../utils/constants.js";

const feeChallanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    challanNumber: { type: String, required: true, unique: true },
    challanType: { type: String, enum: CHALLAN_TYPES, default: "Monthly Fee" },
    class: { type: String, enum: CLASSES, required: true },
    billingMonth: { type: String, required: true }, // e.g. "January 2026"
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    feeAmount: { type: Number, required: true, default: 0 },
    admissionFee: { type: Number, default: 0 },
    examinationFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    fine: { type: Number, default: 0 },
    previousBalance: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    paymentStatus: { type: String, enum: FEE_STATUS, default: "Unpaid" },
    paymentMethod: { type: String, default: "EasyPaisa" },
    easypaisaNumber: { type: String, default: "" },

    transactionReference: { type: String, default: "" },
    paymentDate: { type: Date },
    verifiedBy: { type: String, default: "" },
    verificationStatus: { type: String, enum: VERIFICATION_STATUS, default: "Pending" },

    receiptNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

feeChallanSchema.pre("validate", function (next) {
  const totalCharges =
    (this.feeAmount || 0) +
    (this.admissionFee || 0) +
    (this.examinationFee || 0) +
    (this.otherCharges || 0) +
    (this.previousBalance || 0) +
    (this.fine || 0) -
    (this.discount || 0);
  this.totalAmount = Math.max(totalCharges, 0);
  this.remainingAmount = Math.max(this.totalAmount - (this.paidAmount || 0), 0);

  if (this.paidAmount <= 0) this.paymentStatus = "Unpaid";
  else if (this.paidAmount >= this.totalAmount) this.paymentStatus = "Paid";
  else this.paymentStatus = "Partial";

  next();
});

export default mongoose.model("FeeChallan", feeChallanSchema);
