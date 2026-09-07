import express from "express";
import {
  getAttendanceByClassDate,
  markBulkAttendance,
  getStudentAttendance,
  getClassAttendanceSummary,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getAttendanceByClassDate);
router.post("/bulk", markBulkAttendance);
router.get("/summary", getClassAttendanceSummary);
router.get("/student/:studentId", getStudentAttendance);

export default router;
