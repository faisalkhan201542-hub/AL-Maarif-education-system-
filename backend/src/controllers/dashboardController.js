import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Attendance from "../models/Attendance.js";
import FeeChallan from "../models/FeeChallan.js";
import Exam from "../models/Exam.js";
import Announcement from "../models/Announcement.js";
import { CLASSES } from "../utils/constants.js";

export const getDashboardStats = async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [
    totalStudents,
    totalTeachers,
    todayPresent,
    todayAbsent,
    pendingFeeAgg,
    collectedFeeAgg,
    studentsByClass,
    recentStudents,
    recentFees,
    recentAttendance,
    upcomingExams,
    announcements,
  ] = await Promise.all([
    Student.countDocuments({ status: "Active" }),
    Teacher.countDocuments({ status: "Active" }),
    Attendance.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday }, status: "Present" }),
    Attendance.countDocuments({ date: { $gte: startOfToday, $lte: endOfToday }, status: "Absent" }),
    FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$remainingAmount" } } }]),
    FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
    Promise.all(CLASSES.map(async (c) => ({ class: c, count: await Student.countDocuments({ class: c, status: "Active" }) }))),
    Student.find().sort({ createdAt: -1 }).limit(5),
    FeeChallan.find().populate("student", "name registrationNumber").sort({ createdAt: -1 }).limit(5),
    Attendance.find().populate("student", "name registrationNumber class").sort({ createdAt: -1 }).limit(5),
    Exam.find({ examDate: { $gte: new Date() } }).sort({ examDate: 1 }).limit(5),
    Announcement.find({ status: "Active" }).sort({ date: -1 }).limit(5),
  ]);

  res.json({
    totalStudents,
    totalTeachers,
    totalClasses: CLASSES.length,
    todayPresent,
    todayAbsent,
    pendingFees: pendingFeeAgg[0]?.total || 0,
    collectedFees: collectedFeeAgg[0]?.total || 0,
    studentsByClass,
    recentStudents,
    recentFees,
    recentAttendance,
    upcomingExams,
    announcements,
  });
};
