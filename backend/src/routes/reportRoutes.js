import express from "express";
import { protect } from "../middleware/auth.js";
import {
  exportStudentsExcel,
  exportStudentsWord,
  exportTeachersExcel,
  exportTeachersWord,
  exportAttendanceExcel,
  exportAttendanceWord,
  exportFeesExcel,
  exportFeesWord,
  exportResultsExcel,
  exportResultsWord,
  getAccountingStats,
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect);

router.get("/accounting/stats", getAccountingStats);

router.get("/students/excel", exportStudentsExcel);
router.get("/students/word", exportStudentsWord);
router.get("/teachers/excel", exportTeachersExcel);
router.get("/teachers/word", exportTeachersWord);
router.get("/attendance/excel", exportAttendanceExcel);
router.get("/attendance/word", exportAttendanceWord);
router.get("/fees/excel", exportFeesExcel);
router.get("/fees/word", exportFeesWord);
router.get("/results/excel", exportResultsExcel);
router.get("/results/word", exportResultsWord);

export default router;
