import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Attendance from "../models/Attendance.js";
import FeeChallan from "../models/FeeChallan.js";
import Exam from "../models/Exam.js";
import Announcement from "../models/Announcement.js";
import { CLASSES } from "../utils/constants.js";

export const getDashboardStats = async (req, res) => {
  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const startOfToday = new Date(todayString);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(startOfToday.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    todayPresent,
    todayAbsent,
    pendingFeeAgg,
    collectedFeeAgg,
    boysCount,
    girlsCount,
    recentStudents,
    recentFees,
    recentAttendance,
    upcomingExams,
    announcements,
    feeTrendsAgg,
    admissionTrendsAgg,
    attendanceTrendsAgg,
    pendingFeesCount,
    classWiseAttendance
  ] = await Promise.all([
    Student.countDocuments({ status: "Active" }),
    Teacher.countDocuments({ status: "Active" }),
    Attendance.countDocuments({ dateString: todayString, status: "Present" }),
    Attendance.countDocuments({ dateString: todayString, status: "Absent" }),
    FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$remainingAmount" } } }]),
    FeeChallan.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]),
    Student.countDocuments({ gender: "Male", status: "Active" }),
    Student.countDocuments({ gender: "Female", status: "Active" }),
    Student.find().sort({ createdAt: -1 }).limit(5),
    FeeChallan.find().populate("student", "name registrationNumber").sort({ createdAt: -1 }).limit(5),
    Attendance.find().populate("student", "name registrationNumber class").sort({ createdAt: -1 }).limit(5),
    Exam.find({ examDate: { $gte: new Date() } }).sort({ examDate: 1 }).limit(5),
    Announcement.find({ status: "Active" }).sort({ date: -1 }).limit(5),

    // Trends Data
    FeeChallan.aggregate([
      { $match: { paidDate: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$paidDate" } },
          amount: { $sum: "$paidAmount" }
      }},
      { $sort: { _id: 1 } }
    ]),
    Student.aggregate([
      { $match: { admissionDate: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$admissionDate" } },
          students: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]),
    Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: "$dateString",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]),
    FeeChallan.countDocuments({ status: { $in: ["Pending", "Partial"] } }),
    Attendance.aggregate([
      { $match: { dateString: todayString } },
      { $group: {
          _id: "$class",
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
          total: { $sum: 1 }
      }},
      { $project: {
          _id: 1,
          present: 1,
          absent: 1,
          percentage: { $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1] }
      }},
      { $sort: { percentage: 1 } } // Sort by lowest attendance first
    ])
  ]);

  res.json({
    totalStudents,
    totalTeachers,
    totalClasses: CLASSES.length,
    todayPresent,
    todayAbsent,
    todayAbsentFine: todayAbsent * 50,
    pendingFees: pendingFeeAgg[0]?.total || 0,
    collectedFees: collectedFeeAgg[0]?.total || 0,
    genderStats: { boys: boysCount, girls: girlsCount },
    recentStudents,
    recentFees,
    recentAttendance,
    upcomingExams,
    announcements,
    feeTrends: feeTrendsAgg,
    admissionTrends: admissionTrendsAgg,
    attendanceTrends: attendanceTrendsAgg,
    pendingFeesCount,
    classWiseAttendance
  });
};
