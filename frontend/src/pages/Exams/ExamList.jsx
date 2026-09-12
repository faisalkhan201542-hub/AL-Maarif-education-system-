import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Award, Calendar, BookOpen, Layers } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { CLASSES, EXAM_TYPES } from "../../utils/constants.js";
import { fmtDate } from "../../utils/format.js";

const emptyForm = { title: "", examType: "Monthly Test", class: CLASSES[0], examDate: "", totalMarksPerSubject: 100 };

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

  const getStatusBadge = (dateString) => {
    if (!dateString) return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-semibold">TBD</span>;
    const examDate = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (examDate > today) return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold border border-blue-200">Upcoming</span>;
    if (examDate.getTime() === today.getTime()) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold border border-amber-200">Today</span>;
    return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold border border-emerald-200">Completed</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Examinations"
        subtitle="Manage all class exams, types, and schedules"
        className="from-amber-500 via-orange-500 to-red-500"
        rightElement={
          <button className="px-4 py-2 bg-white text-amber-600 hover:bg-amber-50 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} className="mr-1"/> {showForm ? "Close Form" : "Create Exam"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm grid sm:grid-cols-2 gap-5 animate-in slide-in-from-top-2">
          <div className="sm:col-span-2 border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">New Exam Setup</h2>
          </div>
          <div>
            <label className="label">Exam Title *</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18}/>
              <input required className="input pl-10" placeholder="e.g. Mid Term 2026" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Exam Type</label>
            <div className="relative">
              <Layers className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18}/>
              <select className="input pl-10" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Class *</label>
            <select className="input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Exam Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18}/>
              <input type="date" className="input pl-10" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create Exam</button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? <div className="p-8"><Loader /></div> : exams.length === 0 ? <div className="p-8"><EmptyState title="No exams created yet" icon={Award} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Class</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {exams.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-100">{e.title}</td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700">{e.examType}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-primary-700">{e.class}</td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">{e.examDate ? fmtDate(e.examDate) : "-"}</td>
                    <td className="px-5 py-4">
                      {getStatusBadge(e.examDate)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/exams/${e._id}/results`} className="btn-secondary btn-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300">Enter Marks</Link>
                        <button className="btn-danger btn-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteTarget(e)}>
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete this exam?" message="All results linked to this exam will also be deleted." onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
