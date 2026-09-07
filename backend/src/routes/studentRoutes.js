import express from "express";
import {
  getStudents,
  getStudentById,
  getStudentProfileBundle,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { protect } from "../middleware/auth.js";
import { uploadStudentPhoto } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/", getStudents);
router.post("/", uploadStudentPhoto.single("photo"), createStudent);
router.get("/:id", getStudentById);
router.get("/:id/profile", getStudentProfileBundle);
router.put("/:id", uploadStudentPhoto.single("photo"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;
