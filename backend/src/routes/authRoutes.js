import express from "express";
import { loginPrincipal, getMe, updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginPrincipal);
router.get("/me", protect, getMe);
router.put("/password", protect, updatePassword);

export default router;
