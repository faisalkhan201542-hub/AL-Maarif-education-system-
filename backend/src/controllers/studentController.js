import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import FeeChallan from "../models/FeeChallan.js";
import Result from "../models/Result.js";
import { generateAdmissionNumber, generateRegistrationNumber } from "../utils/idGenerators.js";

// @desc Get all students (search, filter, sort, paginate)
// @route GET /api/students
export const getStudents = async (req, res) => {
  const { search, class: className, status, page = 1, limit = 20, sortBy = "class", sortDir = "asc" } = req.query;

  const query = {};
  if (className) query.class = className;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { fatherName: new RegExp(search, "i") },
      { registrationNumber: new RegExp(search, "i") },
      { fatherWhatsapp: new RegExp(search, "i") },
      { admissionNumber: new RegExp(search, "i") },
    ];
    if (!isNaN(Number(search))) {
      query.$or.push({ rollNumber: Number(search) });
    }
  }

  const sort = { [sortBy]: sortDir === "asc" ? 1 : -1, rollNumber: 1 };
  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(parseInt(limit, 10) || 20, 500);

  const [students, total] = await Promise.all([
    Student.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Student.countDocuments(query),
  ]);

  res.json({
    students,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
};

// @desc Get single student with linked info
// @route GET /api/students/:id
export const getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

// @desc Get a student's full profile bundle (attendance %, fee summary, results)
// @route GET /api/students/:id/profile
export const getStudentProfileBundle = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const [attendanceRecords, challans, results] = await Promise.all([
    Attendance.find({ student: student._id }).sort({ date: -1 }).limit(60),
    FeeChallan.find({ student: student._id }).sort({ issueDate: -1 }),
    Result.find({ student: student._id }).populate("exam", "title examType examDate").sort({ createdAt: -1 }),
  ]);

  const present = attendanceRecords.filter((a) => a.status === "Present").length;
  const absent = attendanceRecords.filter((a) => a.status === "Absent").length;
  const leave = attendanceRecords.filter((a) => a.status === "Leave").length;
  const attendancePercentage =
    attendanceRecords.length > 0 ? Number(((present / attendanceRecords.length) * 100).toFixed(1)) : 0;

  const pendingFees = challans
    .filter((c) => c.paymentStatus !== "Paid")
    .reduce((sum, c) => sum + c.remainingAmount, 0);

  res.json({
    student,
    attendance: { records: attendanceRecords, present, absent, leave, attendancePercentage },
    fees: { challans, pendingFees },
    results,
  });
};

// @desc Create student
// @route POST /api/students
export const createStudent = async (req, res) => {
  const { name, fatherName, fatherWhatsapp, gender, dob, address, class: className, rollNumber, parentContact, admissionDate, status } =
    req.body;

  if (!name || !fatherName || !fatherWhatsapp || !gender || !dob || !className || !rollNumber) {
    return res.status(400).json({ message: "Missing required student fields" });
  }

  const registrationNumber = await generateRegistrationNumber();
  const admissionNumber = await generateAdmissionNumber();

  const photoUrl = req.file ? `/uploads/students/${req.file.filename}` : "";

  const student = await Student.create({
    registrationNumber,
    admissionNumber,
    name,
    fatherName,
    fatherWhatsapp,
    parentContact,
    gender,
    dob,
    address,
    class: className,
    rollNumber,
    photoUrl,
    admissionDate: admissionDate || Date.now(),
    status: status || "Active",
  });

  res.status(201).json(student);
};

// @desc Update student
// @route PUT /api/students/:id
export const updateStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  const fields = [
    "name",
    "fatherName",
    "fatherWhatsapp",
    "parentContact",
    "gender",
    "dob",
    "address",
    "class",
    "rollNumber",
    "admissionDate",
    "status",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) student[f] = req.body[f];
  });

  if (req.file) {
    student.photoUrl = `/uploads/students/${req.file.filename}`;
  }

  await student.save();
  res.json(student);
};

// @desc Delete student
// @route DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  await Promise.all([
    Attendance.deleteMany({ student: student._id }),
    FeeChallan.deleteMany({ student: student._id }),
    Result.deleteMany({ student: student._id }),
    student.deleteOne(),
  ]);

  res.json({ message: "Student and linked records deleted successfully" });
};
