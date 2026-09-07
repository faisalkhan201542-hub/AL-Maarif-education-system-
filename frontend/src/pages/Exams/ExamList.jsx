import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Award } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { CLASSES, EXAM_TYPES } from "../../utils/constants.js";
import { fmtDate } from "../../utils/format.js";

const emptyForm = { title: "", examType: "Monthly Test", class: "KG", examDate: "", totalMarksPerSubject: 100 };

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/exams");
    setExams(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/exams", form);
      toast.success("Exam created");
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exam");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/exams/${deleteTarget._id}`);
      toast.success("Exam deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Examinations</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16}/> Create Exam</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card grid sm:grid-cols-2 gap-4">
          <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <label className="label">Exam Type</label>
            <select className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
              {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class *</label>
            <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Exam Date</label><input type="date" className="input" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} /></div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto p-0">
        {loading ? <Loader /> : exams.length === 0 ? <EmptyState title="No exams created yet" icon={Award} /> : (
          <table className="table-base">
            <thead><tr><th className="th">Title</th><th className="th">Type</th><th className="th">Class</th><th className="th">Date</th><th className="th">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {exams.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="td font-medium">{e.title}</td>
                  <td className="td">{e.examType}</td>
                  <td className="td">{e.class}</td>
                  <td className="td">{fmtDate(e.examDate)}</td>
                  <td className="td">
                    <div className="flex gap-1.5">
                      <Link to={`/exams/${e._id}/results`} className="btn-secondary btn-sm">Enter Marks</Link>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(e)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete this exam?" message="All results linked to this exam will also be deleted." onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
