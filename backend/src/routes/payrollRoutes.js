import express from "express";
import { getPayrolls, savePayroll } from "../controllers/payrollController.js";

const router = express.Router();

router.get("/", getPayrolls);
router.post("/", savePayroll);

export default router;
