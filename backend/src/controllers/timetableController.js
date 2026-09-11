import Timetable from "../models/Timetable.js";

// @route GET /api/timetable
export const getTimetable = async (req, res) => {
  const { class: className } = req.query;
  const query = {};
  if (className) query.class = className;
  
  const timetable = await Timetable.find(query).sort({ day: 1, periodNumber: 1 }).populate("teacher", "name teacherId phone");
  res.json(timetable);
};

// @route POST /api/timetable
export const createPeriod = async (req, res) => {
  const { class: className, day, periodNumber, subject, teacher, startTime, endTime } = req.body;
  if (!className || !day || !periodNumber || !subject || !teacher || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if period already exists
  const existing = await Timetable.findOne({ class: className, day, periodNumber });
  if (existing) {
    return res.status(400).json({ message: "This period is already assigned for this class on this day." });
  }

  try {
    const period = await Timetable.create(req.body);
    res.status(201).json(period);
  } catch (error) {
    if (error.code === 11000) {
      // Check which index failed
      if (error.keyPattern && error.keyPattern.teacher) {
        return res.status(400).json({ message: "This teacher is already assigned to another class during this period." });
      }
      return res.status(400).json({ message: "This period is already assigned for this class on this day." });
    }
    throw error;
  }
};

// @route PUT /api/timetable/:id
export const updatePeriod = async (req, res) => {
  const period = await Timetable.findById(req.params.id);
  if (!period) return res.status(404).json({ message: "Period not found" });

  Object.assign(period, req.body);
  try {
    await period.save();
    res.json(period);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern && error.keyPattern.teacher) {
        return res.status(400).json({ message: "This teacher is already assigned to another class during this period." });
      }
      return res.status(400).json({ message: "This period is already assigned for this class on this day." });
    }
    throw error;
  }
};

// @route DELETE /api/timetable/:id
export const deletePeriod = async (req, res) => {
  const period = await Timetable.findById(req.params.id);
  if (!period) return res.status(404).json({ message: "Period not found" });

  await period.deleteOne();
  res.json({ message: "Period removed" });
};
