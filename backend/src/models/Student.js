import mongoose from "mongoose";
import { CLASSES, GENDERS, STUDENT_STATUS } from "../utils/constants.js";

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true },
    photoUrl: { type: String, default: "" },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherWhatsapp: { type: String, required: true },
    parentContact: { type: String, default: "" },
    gender: { type: String, enum: GENDERS, required: true },
    dob: { type: Date, required: true },
    address: { type: String, default: "" },
    admissionDate: { type: Date, default: Date.now },
    admissionNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: STUDENT_STATUS, default: "Active" },

    class: { type: String, enum: CLASSES, required: true },
    rollNumber: { type: Number, required: true },
    academicYear: { type: String, default: "2026", required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

studentSchema.index({ class: 1, rollNumber: 1, academicYear: 1 }, { unique: true });
studentSchema.index({ name: "text", fatherName: "text" });

const filterDeleted = function (next) {
  if (!this.getOptions().skipFilter) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
};
studentSchema.pre("find", filterDeleted);
studentSchema.pre("findOne", filterDeleted);
studentSchema.pre("countDocuments", filterDeleted);

export default mongoose.model("Student", studentSchema);
