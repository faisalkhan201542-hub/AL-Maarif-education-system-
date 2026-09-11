import express from "express";
import {
  upsertResult,
  getResultsByExam,
  getResultsByStudent,
  getResultById,
  deleteResult,
  blastResults,
} from "../controllers/resultController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.post("/", upsertResult);
router.post("/exam/:examId/blast", blastResults);
router.get("/exam/:examId", getResultsByExam);
router.get("/student/:studentId", getResultsByStudent);
router.get("/:id", getResultById);
router.delete("/:id", deleteResult);

export default router;
