import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import FeeChallan from "../models/FeeChallan.js";
import Result from "../models/Result.js";
import Teacher from "../models/Teacher.js";
import { CLASSES } from "../utils/constants.js";

// @desc Get all classes with counts
// @route GET /api/classes
export const getClasses = async (req, res) => {
  const data = await Promise.all(
    CLASSES.map(async (className) => {
      const [totalStudents, teacher] = await Promise.all([
        Student.countDocuments({ class: className, status: "Active" }),
        Teacher.findOne({ assignedClass: className }),
      ]);
      return { name: className, totalStudents, classTeacher: teacher ? teacher.name : null };
    })
  );
  res.json(data);
};

// @desc Get single class detail: students + today's attendance + pending fees + avg result
// @route GET /api/classes/:name
export const getClassDetail = async (req, res) => {
  const className = req.params.name;
  if (!CLASSES.includes(className)) return res.status(404).json({ message: "Class not found" });

  const students = await Student.find({ class: className }).sort({ rollNumber: 1 });
  const studentIds = students.map((s) => s._id);

  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [todayAttendance, pendingChallans, results, teacher] = await Promise.all([
    Attendance.find({ student: { $in: studentIds }, dateString: todayString }),
    FeeChallan.find({ student: { $in: studentIds }, paymentStatus: { $ne: "Paid" } }),
    Result.find({ student: { $in: studentIds } }),
    Teacher.findOne({ assignedClass: className }),
  ]);

  const presentToday = todayAttendance.filter((a) => a.status === "Present").length;
  const absentToday = todayAttendance.filter((a) => a.status === "Absent").length;
  const pendingFees = pendingChallans.reduce((sum, c) => sum + c.remainingAmount, 0);
  const averageResult =
    results.length > 0
      ? Number((results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1))
      : 0;

  res.json({
    class: className,
    classTeacher: teacher ? teacher.name : null,
    totalStudents: students.length,
    presentToday,
    absentToday,
    pendingFees,
    averageResult,
    students,
  });
};
