import mongoose from "mongoose";
import { CLASSES, EXAM_TYPES } from "../utils/constants.js";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    examType: { type: String, enum: EXAM_TYPES, default: "Monthly Test" },
    class: { type: String, enum: CLASSES, required: true },
    subjects: [{ type: String }],
    totalMarksPerSubject: { type: Number, default: 100 },
    examDate: { type: Date, default: Date.now },
    academicYear: { type: String, default: "2026" },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
