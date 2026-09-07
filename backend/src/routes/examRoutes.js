import express from "express";
import { getExams, getExamById, createExam, updateExam, deleteExam } from "../controllers/examController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getExams);
router.post("/", createExam);
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

export default router;
