import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import FeeChallan from "../models/FeeChallan.js";
import { sendMessage } from "../services/whatsappService.js";

// @desc Get attendance for a class + date
// @route GET /api/attendance?class=KG&date=2026-01-05
export const getAttendanceByClassDate = async (req, res) => {
  const { class: className, date } = req.query;
  if (!className || !date) return res.status(400).json({ message: "class and date are required" });

  const day = new Date(date);
  const dateString = day.toISOString().split("T")[0];

  const students = await Student.find({ class: className, status: "Active" }).sort({ rollNumber: 1 });
  const records = await Attendance.find({ class: className, dateString });

  const merged = students.map((s) => {
    const record = records.find((r) => String(r.student) === String(s._id));
    return {
      student: s,
      status: record ? record.status : null,
      attendanceId: record ? record._id : null,
    };
  });

  res.json(merged);
};

// @desc Mark/update attendance in bulk for a class + date
// @route POST /api/attendance/bulk
// body: { class, date, records: [{ studentId, status }] }
export const markBulkAttendance = async (req, res) => {
  const { class: className, date, records } = req.body;
  if (!className || !date || !Array.isArray(records)) {
    return res.status(400).json({ message: "class, date and records[] are required" });
  }

  const day = new Date(date);
  const dateString = day.toISOString().split("T")[0];

  const existingRecords = await Attendance.find({ dateString, class: className });
  const ops = [];
  const absentStudentsInfo = [];

  records.forEach((r) => {
    const existing = existingRecords.find(e => String(e.student) === String(r.studentId));

    ops.push({
      updateOne: {
        filter: { student: r.studentId, dateString },
        update: { $set: { student: r.studentId, class: className, date: day, dateString, status: r.status, markedBy: "Principal" } },
        upsert: true,
      },
    });

    // We collect info for students who are marked absent today
    if (r.status === "Absent") {
      absentStudentsInfo.push({ studentId: r.studentId, isNewAbsence: (!existing || existing.status !== "Absent") });
    }
  });

  if (ops.length > 0) {
    await Attendance.bulkWrite(ops);
  }

  // Fetch full student details for the absent ones to return to frontend for WhatsApp
  const absentIds = absentStudentsInfo.map(info => info.studentId);
  const fullAbsentStudents = await Student.find({ _id: { $in: absentIds } }).select("name fatherName fatherWhatsapp registrationNumber");
  
  const absentResponse = fullAbsentStudents.map(student => ({
    _id: student._id,
    name: student.name,
    fatherName: student.fatherName,
    fatherWhatsapp: student.fatherWhatsapp,
    registrationNumber: student.registrationNumber
  }));

  // Apply Rs. 50 fine to the current month's fee challan for new absentees
  const newlyAbsentIds = absentStudentsInfo.filter(info => info.isNewAbsence).map(info => info.studentId);
  if (newlyAbsentIds.length > 0) {
    const monthLabel = day.toLocaleString("en-US", { month: "long", year: "numeric" });
    const challans = await FeeChallan.find({ student: { $in: newlyAbsentIds }, billingMonth: monthLabel });
    
    for (const challan of challans) {
      challan.fine = (challan.fine || 0) + 50;
      await challan.save(); // Save triggers pre-validate to update totalAmount
    }
  }

  // Send WhatsApp Absent Alerts
  absentResponse.forEach(student => {
    if (student.fatherWhatsapp) {
      const msg = `🔔 *Al-Maarif Education (Ghair Hazri Alert)*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ka bacha/bachi *${student.name}* (Class: ${className}) aaj school mein ghair-hazir (absent) hai.\nBaraye meharbani bache ki ghair hazri ki wajah se school intizamiya ko aagah karein.\n\nShukriya!`;
      sendMessage(student.fatherWhatsapp, msg).catch(err => console.error("Failed to send absent alert to", student.name, err.message));
    }
  });

  res.json({ 
    message: "Attendance saved successfully",
    absentStudents: absentResponse
  });
};

// @desc Get a student's attendance history + monthly percentage
// @route GET /api/attendance/student/:studentId
export const getStudentAttendance = async (req, res) => {
  const records = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const leave = records.filter((r) => r.status === "Leave").length;
  const percentage = records.length ? Number(((present / records.length) * 100).toFixed(1)) : 0;
  res.json({ records, present, absent, leave, percentage });
};

// @desc Class-wide monthly attendance summary (for reports)
// @route GET /api/attendance/summary?class=KG&month=2026-01
export const getClassAttendanceSummary = async (req, res) => {
  const { class: className, month } = req.query;
  if (!className) return res.status(400).json({ message: "class is required" });

  const query = { class: className };
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);
    query.date = { $gte: start, $lte: end };
  }

  const students = await Student.find({ class: className }).sort({ rollNumber: 1 });
  const records = await Attendance.find(query);

  const summary = students.map((s) => {
    const studentRecords = records.filter((r) => String(r.student) === String(s._id));
    const present = studentRecords.filter((r) => r.status === "Present").length;
    const absent = studentRecords.filter((r) => r.status === "Absent").length;
    const leave = studentRecords.filter((r) => r.status === "Leave").length;
    const total = studentRecords.length;
    const percentage = total ? Number(((present / total) * 100).toFixed(1)) : 0;
    return { student: s, present, absent, leave, total, percentage };
  });

  res.json(summary);
};
