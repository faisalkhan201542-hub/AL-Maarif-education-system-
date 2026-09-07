import express from "express";
import { getClasses, getClassDetail } from "../controllers/classController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getClasses);
router.get("/:name", getClassDetail);

export default router;
