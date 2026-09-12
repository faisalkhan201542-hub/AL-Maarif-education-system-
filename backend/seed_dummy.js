import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Student from "./src/models/Student.js";
import Teacher from "./src/models/Teacher.js";
import Attendance from "./src/models/Attendance.js";
import Expense from "./src/models/Expense.js";

const MONGO_URI = "mongodb+srv://schooladmin123:Maarif12345@cluster0.faevmkq.mongodb.net/?appName=Cluster0";

const CLASSES = [
  "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"
];
const GENDERS = ["Male", "Female"];
const ATTENDANCE_STATUS = ["Present", "Absent", "Leave"];

const firstNamesMale = ["Ali", "Ahmed", "Hamza", "Usman", "Bilal", "Zain", "Saad", "Omar", "Hassan", "Hussain"];
const firstNamesFemale = ["Fatima", "Ayesha", "Zainab", "Maryam", "Khadija", "Hira", "Sana", "Iqra", "Nida", "Amna"];
const lastNames = ["Khan", "Shah", "Malik", "Rehman", "Javed", "Iqbal", "Farooq", "Ahmed", "Tariq", "Hussain"];

const randomName = (gender) => {
  const first = gender === "Male" ? firstNamesMale : firstNamesFemale;
  return `${first[Math.floor(Math.random() * first.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    console.log("Clearing existing dummy data...");
    // Clear students that we seed (we'll give them a specific prefix so we can delete them if needed, or just clear all)
    // Wait, the user wants random data to test the design. It's safe to just delete and recreate to get fresh dummy data.
    await Student.deleteMany({ registrationNumber: { $regex: /^DUMMY-/ } });
    await Teacher.deleteMany({ teacherId: { $regex: /^DUMMY-/ } });
    await Expense.deleteMany({ amount: { $in: [1000, 2000, 3000, 5000, 1500, 2500] } }); // Clear dummy expenses

    console.log("Creating 10 Teachers...");
    const teachers = [];
    for (let i = 1; i <= 10; i++) {
      const gender = Math.random() > 0.5 ? "Male" : "Female";
      teachers.push({
        teacherId: `DUMMY-T${i}`,
        name: randomName(gender),
        phone: `+92300${randomNumber(1000000, 9999999)}`,
        whatsapp: `+92300${randomNumber(1000000, 9999999)}`,
        qualification: "BS Computer Science",
        subject: "Mathematics",
        baseSalary: randomNumber(20000, 50000),
        assignedClass: CLASSES[randomNumber(0, CLASSES.length - 1)],
      });
    }
    const createdTeachers = await Teacher.insertMany(teachers);

    console.log("Creating 100 Students...");
    const students = [];
    for (let i = 1; i <= 100; i++) {
      const gender = Math.random() > 0.5 ? "Male" : "Female";
      students.push({
        registrationNumber: `DUMMY-S${i}`,
        admissionNumber: `DUMMY-A${i}`,
        name: randomName(gender),
        fatherName: randomName("Male"),
        fatherWhatsapp: `+92300${randomNumber(1000000, 9999999)}`,
        gender,
        dob: new Date(2010 + randomNumber(0, 10), randomNumber(0, 11), randomNumber(1, 28)),
        class: CLASSES[randomNumber(0, CLASSES.length - 1)],
        rollNumber: 1000 + i,
        academicYear: "2026",
      });
    }
    const createdStudents = await Student.insertMany(students);

    console.log("Generating Attendance for last 5 days...");
    const attendances = [];
    const today = new Date();
    
    // Clean old dummy attendances for these students
    const studentIds = createdStudents.map(s => s._id);
    await Attendance.deleteMany({ student: { $in: studentIds } });

    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      
      for (const student of createdStudents) {
        attendances.push({
          student: student._id,
          class: student.class,
          date: d,
          dateString,
          status: ATTENDANCE_STATUS[randomNumber(0, 2)], // Present, Absent, Leave
          markedBy: "Principal",
        });
      }
    }
    await Attendance.insertMany(attendances);

    console.log("Generating some dummy expenses...");
    const expenses = [];
    for(let i=0; i<15; i++) {
       const d = new Date(today);
       d.setDate(d.getDate() - randomNumber(0, 30));
       expenses.push({
         title: "Dummy Expense " + i,
         category: ["Salary", "Electricity", "Maintenance", "Office Supplies", "Rent", "Other"][randomNumber(0, 5)],
         amount: [1000, 2000, 3000, 5000, 1500, 2500][randomNumber(0,5)],
         date: d,
         description: "Random dummy expense for testing"
       });
    }
    await Expense.insertMany(expenses);

    console.log("Done seeding dummy data!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
