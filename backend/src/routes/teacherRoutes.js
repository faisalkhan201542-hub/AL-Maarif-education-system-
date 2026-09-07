import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect } from "../middleware/auth.js";
import { uploadTeacherPhoto } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);
router.get("/", getTeachers);
router.post("/", uploadTeacherPhoto.single("photo"), createTeacher);
router.get("/:id", getTeacherById);
router.put("/:id", uploadTeacherPhoto.single("photo"), updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
