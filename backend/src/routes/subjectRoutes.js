import express from "express";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "../controllers/subjectController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getSubjects).post(createSubject);
router.route("/:id").put(updateSubject).delete(deleteSubject);

export default router;
