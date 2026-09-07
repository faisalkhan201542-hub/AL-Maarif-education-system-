import express from "express";
import {
  getTimetable,
  createPeriod,
  updatePeriod,
  deletePeriod,
} from "../controllers/timetableController.js";

const router = express.Router();

router.route("/").get(getTimetable).post(createPeriod);
router.route("/:id").put(updatePeriod).delete(deletePeriod);

export default router;
