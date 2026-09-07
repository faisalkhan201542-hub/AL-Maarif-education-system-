import mongoose from "mongoose";
import { CLASSES, TEACHER_STATUS } from "../utils/constants.js";

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    phone: { type: String, required: true },
    whatsapp: { type: String, required: true },
    qualification: { type: String, default: "" },
    subject: { type: String, default: "" },
    joiningDate: { type: Date, default: Date.now },
    assignedClass: { type: String, enum: [...CLASSES, ""], default: "" },
    status: { type: String, enum: TEACHER_STATUS, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
