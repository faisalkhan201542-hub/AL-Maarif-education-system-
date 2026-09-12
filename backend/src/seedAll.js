import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Teacher from "./models/Teacher.js";
import Student from "./models/Student.js";
import Timetable from "./models/Timetable.js";
import FeeChallan from "./models/FeeChallan.js";
import Expense from "./models/Expense.js";
import Attendance from "./models/Attendance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/al_maarif_education";
    await mongoose.connect(uri);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const CLASSES = ["Play Group", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECTS = ["Maths", "English", "Urdu", "Science", "Islamiyat", "Drawing", "History", "Arabic"];
const TIMES = {
  1: { start: "08:00 AM", end: "08:45 AM" },
  2: { start: "08:45 AM", end: "09:30 AM" },
  3: { start: "09:30 AM", end: "10:15 AM" },
  4: { start: "10:15 AM", end: "11:00 AM" },
  5: { start: "11:00 AM", end: "11:45 AM" },
  6: { start: "11:45 AM", end: "12:30 PM" },
  7: { start: "12:30 PM", end: "01:15 PM" },
  8: { start: "01:15 PM", end: "02:00 PM" }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log("Seeding Teachers...");
    const teacherDocs = [];
    const teacherNames = ["Sir Ali", "Miss Fatima", "Sir Usman", "Miss Ayesha", "Sir Hamza", "Miss Sana"];
    for (let i = 0; i < teacherNames.length; i++) {
      let t = await Teacher.findOne({ name: teacherNames[i] });
      if (!t) {
        t = await Teacher.create({
          teacherId: `AME-TCH-10${i}`,
          name: teacherNames[i],
          phone: "03001234567",
          whatsapp: "03001234567",
          qualification: "BS",
          subject: getRandom(SUBJECTS),
          baseSalary: 25000 + i * 5000,
          assignedClass: getRandom(CLASSES)
        });
      }
      teacherDocs.push(t);
    }

    console.log("Seeding Timetable...");
    for (const cls of ["KG", "1st", "5th", "9th"]) {
      for (const day of DAYS) {
        const assignedPeriods = new Set();
        while (assignedPeriods.size < 4) {
          const p = getRandom(PERIODS);
          if (!assignedPeriods.has(p)) {
            assignedPeriods.add(p);
            const teacher = getRandom(teacherDocs);
            const subject = getRandom(SUBJECTS);
            
            const existingClassPeriod = await Timetable.findOne({ class: cls, day, periodNumber: p });
            const existingTeacherPeriod = await Timetable.findOne({ teacher: teacher._id, day, periodNumber: p });
            
            if (!existingClassPeriod && !existingTeacherPeriod) {
              await Timetable.create({
                class: cls,
                day,
                periodNumber: p,
                subject,
                teacher: teacher._id,
                startTime: TIMES[p].start,
                endTime: TIMES[p].end
              });
            }
          }
        }
      }
    }

    console.log("Seeding Students...");
    const studentDocs = [];
    for (let i = 0; i < 15; i++) {
      let roll = 200 + i;
      let s = await Student.findOne({ rollNumber: roll });
      if (!s) {
        s = await Student.create({
          registrationNumber: `REG-${roll}`,
          admissionNumber: `ADM-${roll}`,
          name: `Student ${i+1}`,
          fatherName: `Father ${i+1}`,
          fatherWhatsapp: "03110000000",
          gender: i % 2 === 0 ? "Male" : "Female",
          dob: new Date("2010-01-01"),
          class: getRandom(["KG", "1st", "5th", "9th"]),
          rollNumber: roll,
          academicYear: "2026"
        });
      }
      studentDocs.push(s);
    }

    console.log("Seeding Fee Challans...");
    for (let i = 0; i < 10; i++) {
      const st = studentDocs[i];
      if (!st) break;
      const existing = await FeeChallan.findOne({ student: st._id });
      if (!existing) {
        await FeeChallan.create({
          student: st._id,
          challanNumber: `CHL-2026-${i+100}`,
          class: st.class,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 86400000 * 5),
          billingMonth: "September 2026",
          feeAmount: 2500,
          totalAmount: 2500,
          paymentStatus: getRandom(["Paid", "Unpaid", "Overdue"]),
          paymentDate: getRandom(["Paid", "Overdue"]) === "Paid" ? new Date() : null,
          paidAmount: getRandom(["Paid", "Overdue"]) === "Paid" ? 2500 : 0
        });
      }
    }

    console.log("Seeding Expenses...");
    for (let i = 1; i <= 5; i++) {
       await Expense.create({
         date: new Date(),
         title: `Random Expense ${i}`,
         category: getRandom(["Salary", "Electricity", "Maintenance", "Office Supplies", "Rent", "Other"]),
         description: `Detail of expense ${i}`,
         amount: i * 1500,
         recordedBy: "Admin"
       });
    }

    console.log("Seeding Attendance...");
    for (const st of studentDocs) {
       const dateStr = new Date().toISOString().split('T')[0];
       const existing = await Attendance.findOne({ student: st._id, date: dateStr });
       if (!existing) {
         await Attendance.create({
           student: st._id,
           class: st.class,
           date: dateStr,
           status: getRandom(["Present", "Absent", "Leave"]),
           markedBy: "Admin"
         });
       }
    }

    console.log("Seeding complete!");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
