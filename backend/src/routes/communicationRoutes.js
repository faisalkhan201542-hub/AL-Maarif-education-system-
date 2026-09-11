import express from "express";
import { getClassContacts } from "../controllers/communicationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/class-contacts", getClassContacts);

export default router;
