import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Save, FileText, CheckCircle2, ArrowLeft, PenTool } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import ExportButtons from "../../components/ExportButtons.jsx";

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

  const exportData = students.map(st => {
    const row = { rollNumber: st.rollNumber, name: st.name };
    exam.subjects.forEach(sub => {
      row[sub] = results[st._id]?.[sub] !== undefined ? results[st._id][sub] : "-";
    });
    return row;
  });

  const exportColumns = [
    { header: "Roll No", key: "rollNumber" },
    { header: "Name", key: "name" },
    ...exam.subjects.map(sub => ({ header: sub, key: sub }))
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={
          <span className="flex items-center gap-2">
            <PenTool className="text-white/80" size={24} /> 
            {exam.title}
          </span>
        }
        subtitle={`Class ${exam.class} • Enter marks per subject (out of ${exam.totalMarksPerSubject})`}
        className="from-rose-500 via-red-500 to-orange-500"
        rightElement={
          <div className="flex items-center gap-2">
            <ExportButtons 
              data={exportData} 
              columns={exportColumns} 
              title={`Exam Results - ${exam.title} (Class ${exam.class})`} 
              filename={`Results_${exam.title.replace(/\s+/g, '_')}_Class${exam.class}`} 
            />
            <Link to="/exams" className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
              <ArrowLeft size={16} /> Back to Exams
            </Link>
          </div>
        }
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4 w-20">Roll No</th>
                <th className="px-5 py-4">Student</th>
                {exam.subjects.map((s) => <th key={s} className="px-5 py-4 text-center">{s}</th>)}
                <th className="px-5 py-4 text-center w-32">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {students.map((st) => {
                const isSaved = !!existingResults[st._id];
                return (
                  <tr key={st._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-500 dark:text-slate-400 dark:text-slate-500">{st.rollNumber}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        {st.photoUrl && <img src={st.photoUrl.startsWith('http') ? st.photoUrl : `http://localhost:5000${st.photoUrl}`} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt="" />}
                        {st.name}
                      </div>
                    </td>
                    {exam.subjects.map((subject) => (
                      <td className="px-2 py-3 text-center" key={subject}>
                        <input
                          type="number"
                          min={0}
                          max={exam.totalMarksPerSubject}
                          className="w-20 px-3 py-1.5 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md focus:bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-300"
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
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Pending</span>
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
                          <Link to={`/results/${existingResults[st._id]}`} className="btn-secondary btn-sm px-3 flex items-center gap-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 bg-white dark:bg-slate-800">
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
