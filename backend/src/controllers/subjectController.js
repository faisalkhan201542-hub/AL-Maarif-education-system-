import Subject from "../models/Subject.js";
import Timetable from "../models/Timetable.js";

// @route GET /api/subjects
export const getSubjects = async (req, res) => {
  const { class: className } = req.query;
  const query = {};
  if (className) query.class = className;
  const subjects = await Subject.find(query).sort({ class: 1, name: 1 }).populate("teacher", "name teacherId phone");
  res.json(subjects);
};

// @route GET /api/subjects/:id/schedule
export const getSubjectSchedule = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    // Find timetable entries for this subject name and class
    const schedule = await Timetable.find({ 
      class: subject.class, 
      subject: subject.name 
    }).sort({ day: 1, periodNumber: 1 });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schedule" });
  }
};

// @route POST /api/subjects
export const createSubject = async (req, res) => {
  const { name, class: className, teacher, schedule } = req.body;
  if (!name || !className) {
    return res.status(400).json({ message: "Name and class are required" });
  }

  try {
    const subject = await Subject.create({
      name,
      class: className,
      teacher,
    });

    if (schedule && schedule.length > 0 && teacher) {
      const timetableEntries = schedule.map(slot => ({
        class: className,
        day: slot.day,
        periodNumber: slot.periodNumber,
        subject: name,
        teacher: teacher,
        startTime: slot.startTime,
        endTime: slot.endTime
      }));
      await Timetable.insertMany(timetableEntries);
    }

    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Schedule conflict: Another subject is already scheduled at this period for this class on this day." });
    }
    res.status(400).json({ message: error.message });
  }
};

// @route PUT /api/subjects/:id
export const updateSubject = async (req, res) => {
  const { name, class: className, teacher, schedule } = req.body;
  
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const oldName = subject.name;
    const oldClass = subject.class;

    if (name) subject.name = name;
    if (className) subject.class = className;
    if (teacher !== undefined) subject.teacher = teacher;

    await subject.save();

    // If schedule is provided, sync the timetable
    if (schedule !== undefined) {
      // Delete old timetable entries for this specific subject
      await Timetable.deleteMany({ class: oldClass, subject: oldName });

      if (schedule.length > 0 && subject.teacher) {
        const timetableEntries = schedule.map(slot => ({
          class: subject.class,
          day: slot.day,
          periodNumber: slot.periodNumber,
          subject: subject.name,
          teacher: subject.teacher,
          startTime: slot.startTime,
          endTime: slot.endTime
        }));
        await Timetable.insertMany(timetableEntries);
      }
    }

    res.json(subject);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Schedule conflict: Another subject is already scheduled at this period for this class on this day." });
    }
    res.status(400).json({ message: error.message });
  }
};

// @route DELETE /api/subjects/:id
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    await Timetable.deleteMany({ class: subject.class, subject: subject.name });
    await subject.deleteOne();
    
    res.json({ message: "Subject and related timetable entries removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
