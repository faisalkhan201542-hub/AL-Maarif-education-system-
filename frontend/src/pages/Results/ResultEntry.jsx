import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function ResultEntry() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({}); // studentId -> { subject: marks }
  const [existingResults, setExistingResults] = useState({}); // studentId -> resultId
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const examRes = await api.get(`/api/exams/${examId}`);
      setExam(examRes.data);
      const studentsRes = await api.get("/api/students", { params: { class: examRes.data.class, limit: 100 } });
      setStudents(studentsRes.data.students);

      const resultsRes = await api.get(`/api/results/exam/${examId}`);
      const marksMap = {};
      const idMap = {};
      resultsRes.data.forEach((r) => {
        marksMap[r.student._id] = {};
        r.subjects.forEach((s) => { marksMap[r.student._id][s.subject] = s.obtainedMarks; });
        idMap[r.student._id] = r._id;
      });
      setResults(marksMap);
      setExistingResults(idMap);
      setLoading(false);
    };
    load();
  }, [examId]);

  const handleMarkChange = (studentId, subject, value) => {
    setResults((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [subject]: value } }));
  };

  const handleSave = async (studentId) => {
    setSavingId(studentId);
    try {
      const subjects = exam.subjects.map((subject) => ({
        subject,
        totalMarks: exam.totalMarksPerSubject,
        obtainedMarks: Number(results[studentId]?.[subject]) || 0,
      }));
      const res = await api.post("/api/results", { student: studentId, exam: examId, subjects });
      setExistingResults((prev) => ({ ...prev, [studentId]: res.data._id }));
      toast.success("Marks saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save marks");
    } finally {
      setSavingId(null);
    }
  };

  if (loading || !exam) return <Loader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
        <p className="text-sm text-gray-400">Class {exam.class} • Enter marks per subject (out of {exam.totalMarksPerSubject})</p>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Roll</th><th className="th">Student</th>
              {exam.subjects.map((s) => <th key={s} className="th">{s}</th>)}
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((st) => (
              <tr key={st._id}>
                <td className="td">{st.rollNumber}</td>
                <td className="td font-medium">{st.name}</td>
                {exam.subjects.map((subject) => (
                  <td className="td" key={subject}>
                    <input
                      type="number"
                      min={0}
                      max={exam.totalMarksPerSubject}
                      className="input w-20 py-1"
                      value={results[st._id]?.[subject] ?? ""}
                      onChange={(e) => handleMarkChange(st._id, subject, e.target.value)}
                    />
                  </td>
                ))}
                <td className="td">
                  <div className="flex gap-1.5">
                    <button className="btn-primary btn-sm" disabled={savingId === st._id} onClick={() => handleSave(st._id)}>
                      {savingId === st._id ? "Saving..." : "Save"}
                    </button>
                    {existingResults[st._id] && (
                      <Link to={`/results/${existingResults[st._id]}`} className="btn-secondary btn-sm">Result Card</Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
