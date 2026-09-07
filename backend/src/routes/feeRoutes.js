import express from "express";
import {
  getChallans,
  getChallanById,
  getChallansByStudent,
  createChallan,
  updateChallan,
  recordPayment,
  verifyPayment,
  deleteChallan,
  getChallanWhatsappLink,
  getFeeReminderWhatsappLink,
} from "../controllers/feeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getChallans);
router.post("/", createChallan);
router.get("/student/:studentId", getChallansByStudent);
router.get("/:id", getChallanById);
router.put("/:id", updateChallan);
router.put("/:id/record-payment", recordPayment);
router.put("/:id/verify", verifyPayment);
router.delete("/:id", deleteChallan);
router.get("/:id/whatsapp-link", getChallanWhatsappLink);
router.get("/:id/whatsapp-reminder", getFeeReminderWhatsappLink);

export default router;
