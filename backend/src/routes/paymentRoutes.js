import express from "express";
import { getPublicChallan, createCheckoutSession } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/:id", getPublicChallan);
router.post("/:id/create-checkout-session", createCheckoutSession);

export default router;
