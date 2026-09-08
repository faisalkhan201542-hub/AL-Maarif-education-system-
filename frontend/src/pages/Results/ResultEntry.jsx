import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Save, FileText, CheckCircle2, ArrowLeft, PenTool } from "lucide-react";
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
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/exams" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <PenTool className="text-primary-600" size={24} /> 
              {exam.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Class <span className="font-semibold text-slate-700">{exam.class}</span> • Enter marks per subject (out of {exam.totalMarksPerSubject})
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 w-20">Roll No</th>
                <th className="px-5 py-4">Student</th>
                {exam.subjects.map((s) => <th key={s} className="px-5 py-4 text-center">{s}</th>)}
                <th className="px-5 py-4 text-center w-32">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => {
                const isSaved = !!existingResults[st._id];
                return (
                  <tr key={st._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-500">{st.rollNumber}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        {st.photoUrl && <img src={st.photoUrl.startsWith('http') ? st.photoUrl : `http://localhost:5000${st.photoUrl}`} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="" />}
                        {st.name}
                      </div>
                    </td>
                    {exam.subjects.map((subject) => (
                      <td className="px-2 py-3 text-center" key={subject}>
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarksPerSubject}
                          className="w-20 px-3 py-1.5 text-center bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all font-medium text-slate-700"
                          value={results[st._id]?.[subject] ?? ""}
                          onChange={(e) => handleMarkChange(st._id, subject, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="px-5 py-3 text-center">
                      {isSaved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Saved
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="btn-primary btn-sm px-3 flex items-center gap-1" 
                          disabled={savingId === st._id} 
                          onClick={() => handleSave(st._id)}
                        >
                          <Save size={14} /> {savingId === st._id ? "Saving..." : "Save"}
                        </button>
                        {isSaved && (
                          <Link to={`/results/${existingResults[st._id]}`} className="btn-secondary btn-sm px-3 flex items-center gap-1 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white">
                            <FileText size={14} /> View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
