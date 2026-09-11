import mongoose from "mongoose";

const subjectMarkSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    obtainedMarks: { type: Number, required: true, default: 0 },
    grade: { type: String, default: "" },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    class: { type: String, required: true },
    subjects: [subjectMarkSchema],
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "" },
    status: { type: String, enum: ["Pass", "Fail"], default: "Pass" },
    position: { type: Number, default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });
resultSchema.index({ exam: 1, class: 1, percentage: -1 });
resultSchema.index({ student: 1, class: 1 });

function gradeFromPercentage(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

resultSchema.pre("validate", function (next) {
  let total = 0;
  let obtained = 0;
  this.subjects.forEach((s) => {
    s.grade = gradeFromPercentage((s.obtainedMarks / s.totalMarks) * 100 || 0);
    total += s.totalMarks;
    obtained += s.obtainedMarks;
  });
  this.totalMarks = total;
  this.obtainedMarks = obtained;
  this.percentage = total > 0 ? Number(((obtained / total) * 100).toFixed(2)) : 0;
  this.grade = gradeFromPercentage(this.percentage);
  this.status = this.percentage >= 40 ? "Pass" : "Fail";
  next();
});

export default mongoose.model("Result", resultSchema);
