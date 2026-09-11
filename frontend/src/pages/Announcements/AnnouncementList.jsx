import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Megaphone } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { ANNOUNCEMENT_TYPES, ANNOUNCEMENT_PRIORITY } from "../../utils/constants.js";
import { fmtDate } from "../../utils/format.js";

const emptyForm = { title: "", description: "", type: "School", priority: "Normal", date: new Date().toISOString().substring(0, 10) };

export default function AnnouncementList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/announcements");
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/announcements", form);
      toast.success("Announcement posted");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    }
  };

  const handleDelete = async () => {
    await api.delete(`/api/announcements/${deleteTarget._id}`);
    toast.success("Announcement removed");
    setDeleteTarget(null);
    load();
  };

  const priorityColor = { High: "badge-red", Normal: "badge-yellow", Low: "badge-gray" };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Announcements"
        subtitle="Manage school-wide and class-specific announcements"
        className="from-indigo-500 via-purple-500 to-pink-500"
        rightElement={
          <button className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors" onClick={() => setShowForm(!showForm)}>
            <Plus size={16}/> New Announcement
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="label">Description *</label><textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {ANNOUNCEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {ANNOUNCEMENT_PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Post</button>
          </div>
        </form>
      )}

      {loading ? <Loader /> : items.length === 0 ? <EmptyState title="No announcements yet" icon={Megaphone} /> : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="card flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{a.title}</h3>
                  <span className={priorityColor[a.priority]}>{a.priority}</span>
                  <span className="badge-gray">{a.type}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">{a.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{fmtDate(a.date)}</p>
              </div>
              <button className="btn-danger btn-sm shrink-0" onClick={() => setDeleteTarget(a)}><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete this announcement?" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
