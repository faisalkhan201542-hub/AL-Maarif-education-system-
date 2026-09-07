import mongoose from "mongoose";
import { ATTENDANCE_STATUS, CLASSES } from "../utils/constants.js";

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: String, enum: CLASSES, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    markedBy: { type: String, default: "Principal" },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
