import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Exam from "../models/Exam.js";
import { CLASSES, SUBJECTS_BY_CLASS } from "../utils/constants.js";

dotenv.config();

const YEAR = new Date().getFullYear();
const terms = ["Mid Term", "Final Term"];

async function addExams() {
  await connectDB();
  console.log("Connected to DB. Adding Term Exams...");

  const newExams = [];
  let d = new Date();
  
  for (const className of CLASSES) {
    // Check if Mid Term already exists to prevent duplicate runs
    const exists = await Exam.findOne({ class: className, title: `Mid Term - ${className}`, academicYear: String(YEAR) });
    if (exists) {
      console.log(`Exams for ${className} already exist. Skipping...`);
      continue;
    }

    for (let i = 0; i < terms.length; i++) {
      const termDate = new Date();
      termDate.setMonth(termDate.getMonth() + (i + 1) * 3); // Spaced out dates

      newExams.push({
        title: `${terms[i]} - ${className}`,
        examType: terms[i], // e.g., 'First Term'
        class: className,
        subjects: SUBJECTS_BY_CLASS[className],
        totalMarksPerSubject: 100,
        examDate: termDate,
        academicYear: String(YEAR),
      });
    }
  }

  if (newExams.length > 0) {
    await Exam.insertMany(newExams);
    console.log(`Successfully added ${newExams.length} Term exams.`);
  }

  console.log("Done.");
  process.exit(0);
}

addExams().catch(console.error);
