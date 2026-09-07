import Exam from "../models/Exam.js";
import Result from "../models/Result.js";
import { SUBJECTS_BY_CLASS } from "../utils/constants.js";

// @route GET /api/exams
export const getExams = async (req, res) => {
  const { class: className } = req.query;
  const query = {};
  if (className) query.class = className;
  const exams = await Exam.find(query).sort({ examDate: -1 });
  res.json(exams);
};

// @route GET /api/exams/:id
export const getExamById = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.json(exam);
};

// @route POST /api/exams
export const createExam = async (req, res) => {
  const { title, examType, class: className, subjects, totalMarksPerSubject, examDate, academicYear } = req.body;
  if (!title || !className) return res.status(400).json({ message: "title and class are required" });

  const exam = await Exam.create({
    title,
    examType,
    class: className,
    subjects: subjects && subjects.length ? subjects : SUBJECTS_BY_CLASS[className] || [],
    totalMarksPerSubject: totalMarksPerSubject || 100,
    examDate,
    academicYear,
  });
  res.status(201).json(exam);
};

// @route PUT /api/exams/:id
export const updateExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  const fields = ["title", "examType", "class", "subjects", "totalMarksPerSubject", "examDate", "academicYear"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) exam[f] = req.body[f];
  });
  await exam.save();
  res.json(exam);
};

// @route DELETE /api/exams/:id
export const deleteExam = async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  await Promise.all([Result.deleteMany({ exam: exam._id }), exam.deleteOne()]);
  res.json({ message: "Exam and its results deleted successfully" });
};
