import mongoose from "mongoose";
import { CLASSES } from "../utils/constants.js";

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      enum: CLASSES,
      required: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    startTime: {
      type: String, // e.g., "08:00 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g., "08:45 AM"
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a class doesn't have overlapping periods for the same day and period number
timetableSchema.index({ class: 1, day: 1, periodNumber: 1 }, { unique: true });

// Prevent a teacher from being assigned to two different classes in the same period on the same day
timetableSchema.index({ teacher: 1, day: 1, periodNumber: 1 }, { unique: true });

export default mongoose.model("Timetable", timetableSchema);
