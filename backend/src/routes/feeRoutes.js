import express from "express";
import {
  getChallans,
  getChallanById,
  getChallansByStudent,
  createChallan,
  bulkCreateChallans,
  blastReminders,
  updateChallan,
  recordPayment,
  verifyPayment,
  receivePayment,
  deleteChallan,
  getChallanWhatsappLink,
  getFeeReminderWhatsappLink,
} from "../controllers/feeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getChallans);
router.post("/", createChallan);
router.post("/bulk", bulkCreateChallans);
router.post("/blast-reminders", blastReminders);
router.get("/student/:studentId", getChallansByStudent);
router.get("/:id", getChallanById);
router.put("/:id", updateChallan);
router.put("/:id/receive-payment", receivePayment);
router.put("/:id/record-payment", recordPayment);
router.put("/:id/verify", verifyPayment);
router.delete("/:id", deleteChallan);
router.get("/:id/whatsapp-link", getChallanWhatsappLink);
router.get("/:id/whatsapp-reminder", getFeeReminderWhatsappLink);

export default router;
