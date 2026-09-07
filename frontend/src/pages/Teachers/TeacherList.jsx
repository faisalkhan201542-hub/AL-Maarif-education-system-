import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/teachers", { params: { search } });
    setTeachers(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    try {
      await api.delete(`/api/teachers/${deleteTarget._id}`);
      toast.success("Teacher deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
        <button className="btn-primary" onClick={() => navigate("/teachers/new")}><Plus size={16}/> Add Teacher</button>
      </div>

      <div className="card">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search teacher by name, ID, subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-secondary" type="submit">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? <Loader /> : teachers.length === 0 ? <EmptyState title="No teachers found" /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Photo</th><th className="th">Teacher ID</th><th className="th">Name</th>
                <th className="th">Subject</th><th className="th">Class</th><th className="th">Phone</th>
                <th className="th">Status</th><th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="td"><img src={t.photoUrl?.startsWith("http") ? t.photoUrl : `${API_URL}${t.photoUrl}`} className="w-9 h-9 rounded-full object-cover bg-gray-100" alt={t.name} /></td>
                  <td className="td font-mono text-xs">{t.teacherId}</td>
                  <td className="td font-medium">{t.name}</td>
                  <td className="td">{t.subject}</td>
                  <td className="td">{t.assignedClass || "-"}</td>
                  <td className="td">{t.phone}</td>
                  <td className="td"><span className="badge-green">{t.status}</span></td>
                  <td className="td">
                    <div className="flex gap-1.5">
                      <Link to={`/teachers/${t._id}/edit`} className="btn-secondary btn-sm"><Pencil size={14}/></Link>
                      <button className="btn-danger btn-sm" onClick={() => setDeleteTarget(t)}><Trash2 size={14}/></button>
                      <WhatsAppButton phone={t.whatsapp} label="" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete this teacher?" message={`Remove ${deleteTarget?.name} from records.`} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
