import mongoose from "mongoose";
import { ANNOUNCEMENT_PRIORITY, ANNOUNCEMENT_TYPES } from "../utils/constants.js";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ANNOUNCEMENT_TYPES, default: "School" },
    date: { type: Date, default: Date.now },
    priority: { type: String, enum: ANNOUNCEMENT_PRIORITY, default: "Normal" },
    status: { type: String, enum: ["Active", "Archived"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
