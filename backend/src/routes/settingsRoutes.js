import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
import { uploadLogo } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getSettings); // public read (used by login page for logo/branding)
router.put("/", protect, uploadLogo.fields([{ name: "logo", maxCount: 1 }, { name: "qrCode", maxCount: 1 }]), updateSettings);

export default router;
