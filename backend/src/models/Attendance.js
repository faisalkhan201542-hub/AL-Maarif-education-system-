import mongoose from "mongoose";
import { ATTENDANCE_STATUS, CLASSES } from "../utils/constants.js";

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    class: { type: String, enum: CLASSES, required: true },
    date: { type: Date, required: true },
    dateString: { type: String, required: true },
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    markedBy: { type: String, default: "Principal" },
  },
  { timestamps: true }
);

attendanceSchema.pre("validate", function (next) {
  if (this.date && !this.dateString) {
    this.dateString = new Date(this.date).toISOString().split("T")[0];
  }
  next();
});

attendanceSchema.index({ student: 1, dateString: 1 }, { unique: true });
attendanceSchema.index({ class: 1, dateString: 1 });

export default mongoose.model("Attendance", attendanceSchema);
