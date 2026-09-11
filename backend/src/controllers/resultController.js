import Result from "../models/Result.js";
import Exam from "../models/Exam.js";
import Student from "../models/Student.js";
import { sendMessage } from "../services/whatsappService.js";

// @desc Enter/update marks for a student in an exam
// @route POST /api/results
export const upsertResult = async (req, res) => {
  const { student: studentId, exam: examId, subjects, remarks } = req.body;

  const [student, exam] = await Promise.all([Student.findById(studentId), Exam.findById(examId)]);
  if (!student) return res.status(404).json({ message: "Student not found" });
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  let result = await Result.findOne({ student: studentId, exam: examId });
  if (result) {
    result.subjects = subjects;
    result.remarks = remarks || result.remarks;
  } else {
    result = new Result({ student: studentId, exam: examId, class: student.class, subjects, remarks });
  }
  await result.save();

  await recalculatePositions(examId, student.class);
  const updated = await Result.findById(result._id);
  res.status(201).json(updated);
};

async function recalculatePositions(examId, className) {
  const results = await Result.find({ exam: examId, class: className }).sort({ percentage: -1 });
  for (let i = 0; i < results.length; i++) {
    results[i].position = i + 1;
    await results[i].save();
  }
}

// @route GET /api/results/exam/:examId
export const getResultsByExam = async (req, res) => {
  const results = await Result.find({ exam: req.params.examId })
    .populate("student", "name registrationNumber rollNumber class fatherName photoUrl")
    .sort({ position: 1 });
  res.json(results);
};

// @route GET /api/results/student/:studentId
export const getResultsByStudent = async (req, res) => {
  const results = await Result.find({ student: req.params.studentId })
    .populate("exam", "title examType examDate class")
    .sort({ createdAt: -1 });
  res.json(results);
};

// @route GET /api/results/:id  (single result card)
export const getResultById = async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate("student")
    .populate("exam");
  if (!result) return res.status(404).json({ message: "Result not found" });
  res.json(result);
};

// @route DELETE /api/results/:id
export const deleteResult = async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return res.status(404).json({ message: "Result not found" });
  await result.deleteOne();
  res.json({ message: "Result deleted successfully" });
};

// @desc Blast WhatsApp Result for an exam
// @route POST /api/results/exam/:examId/blast
export const blastResults = async (req, res) => {
  const { examId } = req.params;
  const results = await Result.find({ exam: examId }).populate("student").populate("exam");
  if (!results || results.length === 0) {
    return res.status(404).json({ message: "No results found for this exam." });
  }

  let sentCount = 0;
  for (const result of results) {
    if (result.student && result.student.fatherWhatsapp) {
      const msg = `🎓 *Al-Maarif Education (Nateeja / Result)*\n\nAssalam-o-Alaikum!\nAap ke bache *${result.student.name}* (Class: ${result.student.class}) ka nateeja (Exam: ${result.exam.title}) aa gaya hai.\n\n*Result Tafseel:*\n- Total Marks: ${result.totalMarks}\n- Obtained Marks: ${result.obtainedMarks}\n- Percentage: ${result.percentage.toFixed(2)}%\n- Position in Class: ${result.position || "N/A"}\n\nMazeed tafseel aur result card ke liye school tashreef layein.\nShukriya!`;
      sendMessage(result.student.fatherWhatsapp, msg).catch(err => console.error("Failed to send result alert to", result.student.name, err.message));
      sentCount++;
    }
  }

  res.json({ message: `Results blasted to ${sentCount} students.` });
};
