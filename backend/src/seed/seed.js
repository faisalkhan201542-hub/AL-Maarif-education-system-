import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import Principal from "../models/Principal.js";
import SchoolSettings from "../models/SchoolSettings.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import FeeChallan from "../models/FeeChallan.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import Announcement from "../models/Announcement.js";

import { CLASSES, SUBJECTS_BY_CLASS } from "../utils/constants.js";
import { boyFirstNames, girlFirstNames, lastNames, teacherQualifications, addresses, pick } from "./data/names.js";

dotenv.config();

const YEAR = new Date().getFullYear();
const STUDENTS_PER_CLASS = 15;

// Approximate birth year per class (KG ~ age 4-5, 10th ~ age 15-16)
const classAgeStart = {
  KG: 4, "1st": 5, "2nd": 6, "3rd": 7, "4th": 8, "5th": 9,
  "6th": 10, "7th": 11, "8th": 12, "9th": 13, "10th": 14,
};

function randomDOB(className, seedIndex) {
  const age = classAgeStart[className] + (seedIndex % 2); // slight variation
  const year = new Date().getFullYear() - age;
  const month = seedIndex % 12;
  const day = (seedIndex % 27) + 1;
  return new Date(year, month, day);
}

function studentPhone(globalIndex) {
  const subscriber = 3000000001 + globalIndex; // 10-digit PK mobile subscriber part
  return `+92${subscriber}`;
}

function avatarUrl(gender, seedIndex) {
  // Uses a deterministic placeholder avatar service (DiceBear) - not real people's photos
  const style = gender === "Male" ? "boy" : "girl";
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${style}${seedIndex}`;
}

function teacherAvatarUrl(seedIndex) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=teacher${seedIndex}`;
}

async function run() {
  await connectDB();
  console.log("Connected. Clearing existing collections...");

  await Promise.all([
    Principal.deleteMany({}),
    SchoolSettings.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Attendance.deleteMany({}),
    FeeChallan.deleteMany({}),
    Exam.deleteMany({}),
    Result.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  // ---------- Principal ----------
  const principal = await Principal.create({
    name: process.env.PRINCIPAL_NAME || "Murad Khalil",
    whatsapp: process.env.PRINCIPAL_WHATSAPP || "+923139163732",
    password: process.env.PRINCIPAL_PASSWORD || "Maarif@123",
  });
  console.log(`Principal created: ${principal.name} (${principal.whatsapp})`);

  // ---------- School Settings ----------
  await SchoolSettings.create({
    schoolName: "Al-Maarif Education",
    address: "512, Near Professor Colony",
    principalName: "Murad Khalil",
    principalWhatsapp: "+923139163732",
    schoolPhone: "+923139163732",
    schoolEmail: "info@almaarifeducation.edu.pk",
    academicYear: String(YEAR),
    googleMapsLink: "",
    paymentMethod: "EasyPaisa",
    easypaisaNumber: "+923139163732",
    easypaisaAccountName: "Murad Khalil",
  });
  console.log("School settings created.");

  // ---------- Teachers ----------
  const teacherNames = ["Miss Kafia", "Miss Aisha", "Miss Gulalai"];
  const teacherSubjects = ["English", "Math", "Science"];
  // Distribute 11 classes reasonably across 3 teachers
  const classAssignments = [
    ["KG", "1st", "2nd", "3rd"],
    ["4th", "5th", "6th", "7th"],
    ["8th", "9th", "10th"],
  ];

  const teachers = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const t = await Teacher.create({
      teacherId: `AME-TCH-${String(i + 1).padStart(3, "0")}`,
      name: teacherNames[i],
      photoUrl: teacherAvatarUrl(i),
      phone: `+9230${(1 + i)}1112223`,
      whatsapp: `+9230${(1 + i)}1112223`,
      qualification: pick(teacherQualifications, i),
      subject: teacherSubjects[i],
      joiningDate: new Date(YEAR - (3 - i), 7, 1),
      assignedClass: classAssignments[i][0],
      status: "Active",
    });
    teachers.push(t);
  }
  console.log(`Created ${teachers.length} teachers.`);

  // ---------- Students (11 classes x 15 = 165) ----------
  let regCounter = 1;
  let admCounter = 1;
  let globalIndex = 0;
  const allStudents = [];

  for (const className of CLASSES) {
    for (let roll = 1; roll <= STUDENTS_PER_CLASS; roll++) {
      const isMale = globalIndex % 2 === 0;
      const first = isMale ? pick(boyFirstNames, globalIndex) : pick(girlFirstNames, globalIndex);
      const last = pick(lastNames, globalIndex + roll);
      const fatherFirst = pick(boyFirstNames, globalIndex + 7);
      const name = `${first} ${last}`;
      const fatherName = `${fatherFirst} ${last}`;

      const registrationNumber = `AME-${YEAR}-${String(regCounter).padStart(4, "0")}`;
      const admissionNumber = `ADM-${YEAR}-${String(admCounter).padStart(4, "0")}`;

      allStudents.push({
        registrationNumber,
        admissionNumber,
        name,
        fatherName,
        fatherWhatsapp: studentPhone(globalIndex),
        parentContact: "",
        gender: isMale ? "Male" : "Female",
        dob: randomDOB(className, globalIndex),
        address: pick(addresses, globalIndex),
        admissionDate: new Date(YEAR - 1, globalIndex % 12, (globalIndex % 27) + 1),
        class: className,
        rollNumber: roll,
        photoUrl: avatarUrl(isMale ? "Male" : "Female", globalIndex),
        status: "Active",
      });

      regCounter++;
      admCounter++;
      globalIndex++;
    }
  }

  const createdStudents = await Student.insertMany(allStudents);
  console.log(`Created ${createdStudents.length} students across ${CLASSES.length} classes.`);

  // ---------- Attendance (last 20 school days) ----------
  const attendanceDocs = [];
  const today = new Date();
  const days = [];
  let d = new Date(today);
  while (days.length < 20) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(d)); // skip weekends
  }

  createdStudents.forEach((student, sIdx) => {
    days.forEach((date, dIdx) => {
      const roll = (sIdx + dIdx) % 20;
      let status = "Present";
      if (roll === 0) status = "Absent";
      else if (roll === 1) status = "Leave";
      const dt = new Date(date);
      dt.setHours(0, 0, 0, 0);
      attendanceDocs.push({
        student: student._id,
        class: student.class,
        date: dt,
        status,
        markedBy: "Principal",
      });
    });
  });
  await Attendance.insertMany(attendanceDocs, { ordered: false }).catch(() => {});
  console.log(`Created ${attendanceDocs.length} attendance records.`);

  // ---------- Fee Challans (current month challan for every student) ----------
  const monthLabel = today.toLocaleString("en-US", { month: "long", year: "numeric" });
  let challanCounter = 1;
  const feeAmountByClass = {
    KG: 3000, "1st": 3200, "2nd": 3200, "3rd": 3500, "4th": 3500, "5th": 3800,
    "6th": 4000, "7th": 4200, "8th": 4200, "9th": 4800, "10th": 5000,
  };

  const feeChallanDocs = createdStudents.map((student, idx) => {
    const feeAmount = feeAmountByClass[student.class] || 3500;
    const cycle = idx % 5;
    let paidAmount = 0;
    let verificationStatus = "Pending";
    let transactionReference = "";
    let paymentDate = undefined;
    let receiptNumber = "";

    if (cycle === 0) {
      // Fully paid & verified
      paidAmount = feeAmount;
      verificationStatus = "Verified";
      transactionReference = `EP${100000 + idx}`;
      paymentDate = new Date();
      receiptNumber = `AME-RCPT-${YEAR}-${String(idx + 1).padStart(4, "0")}`;
    } else if (cycle === 1) {
      // Partial payment, pending verification
      paidAmount = Math.round(feeAmount * 0.5);
      verificationStatus = "Pending";
      transactionReference = `EP${200000 + idx}`;
      paymentDate = new Date();
    } else {
      // Unpaid
      paidAmount = 0;
    }

    const dueDate = new Date(today.getFullYear(), today.getMonth(), 10);

    return {
      student: student._id,
      challanNumber: `AME-FEE-${YEAR}-${String(challanCounter++).padStart(4, "0")}`,
      challanType: "Monthly Fee",
      class: student.class,
      billingMonth: monthLabel,
      issueDate: new Date(today.getFullYear(), today.getMonth(), 1),
      dueDate,
      feeAmount,
      discount: 0,
      fine: 0,
      previousBalance: 0,
      paidAmount,
      paymentMethod: "EasyPaisa",
      easypaisaNumber: "+923139163732",
      transactionReference,
      paymentDate,
      verificationStatus,
      verifiedBy: verificationStatus === "Verified" ? "Murad Khalil" : "",
      receiptNumber,
    };
  });

  // totalAmount/remainingAmount/paymentStatus computed by pre-validate hook -> use create loop for hooks to run
  const createdChallans = [];
  for (const doc of feeChallanDocs) {
    createdChallans.push(await FeeChallan.create(doc));
  }
  console.log(`Created ${createdChallans.length} fee challans.`);

  // ---------- Exams & Results ----------
  const exams = [];
  for (const className of CLASSES) {
    const exam = await Exam.create({
      title: `Monthly Test - ${className}`,
      examType: "Monthly Test",
      class: className,
      subjects: SUBJECTS_BY_CLASS[className],
      totalMarksPerSubject: 100,
      examDate: new Date(),
      academicYear: String(YEAR),
    });
    exams.push(exam);
  }
  console.log(`Created ${exams.length} exams.`);

  for (const exam of exams) {
    const classStudents = createdStudents.filter((s) => s.class === exam.class);
    const results = [];
    for (const student of classStudents) {
      const subjects = exam.subjects.map((subject, sIdx) => {
        const base = 55 + ((student.rollNumber * 3 + sIdx * 7) % 40); // 55-94 range
        return { subject, totalMarks: exam.totalMarksPerSubject, obtainedMarks: base };
      });
      const result = new Result({ student: student._id, exam: exam._id, class: exam.class, subjects });
      await result.save();
      results.push(result);
    }
    // assign positions
    const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
    for (let i = 0; i < sorted.length; i++) {
      sorted[i].position = i + 1;
      await sorted[i].save();
    }
  }
  console.log("Results generated for all classes.");

  // ---------- Announcements ----------
  await Announcement.insertMany([
    {
      title: "Welcome to New Academic Year",
      description: "Al-Maarif Education welcomes all students and parents to the new academic year. Classes begin as per the schedule.",
      type: "School",
      date: new Date(),
      priority: "High",
    },
    {
      title: "Monthly Test Schedule Announced",
      description: "Monthly tests for all classes will be conducted this month. Please check the exam section for details.",
      type: "Exam",
      date: new Date(),
      priority: "Normal",
    },
    {
      title: "Fee Submission Reminder",
      description: "Parents are requested to submit the monthly fee via EasyPaisa before the due date to avoid fines.",
      type: "Fee",
      date: new Date(),
      priority: "High",
    },
  ]);
  console.log("Sample announcements created.");

  console.log("\n===================================================");
  console.log(" SEED COMPLETE — Al-Maarif Education");
  console.log("===================================================");
  console.log(`Principal login WhatsApp: ${principal.whatsapp}`);
  console.log(`Principal login password: ${process.env.PRINCIPAL_PASSWORD || "Maarif@123"}`);
  console.log(`Teachers: ${teachers.length}`);
  console.log(`Classes: ${CLASSES.length}`);
  console.log(`Students: ${createdStudents.length}`);
  console.log(`Attendance records: ${attendanceDocs.length}`);
  console.log(`Fee challans: ${createdChallans.length}`);
  console.log(`Exams: ${exams.length}`);
  console.log("===================================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
