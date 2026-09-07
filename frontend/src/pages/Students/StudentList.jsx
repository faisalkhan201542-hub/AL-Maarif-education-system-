import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import { CLASSES } from "../../utils/constants.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/students", { params: { search, class: className, page, limit: 20 } });
      setStudents(res.data.students);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, className]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/students/${deleteTarget._id}`);
      toast.success("Student deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-sm text-gray-400">{total} students found</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/students/new")}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, father name, registration no, WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input sm:w-48" value={className} onChange={(e) => { setClassName(e.target.value); setPage(1); }}>
            <option value="">All Classes</option>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-secondary" type="submit">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <Loader />
        ) : students.length === 0 ? (
          <EmptyState title="No students found" subtitle="Try adjusting your search or filters." />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Photo</th>
                <th className="th">Reg. No</th>
                <th className="th">Name</th>
                <th className="th">Father Name</th>
                <th className="th">Class</th>
                <th className="th">Roll No</th>
                <th className="th">Father WhatsApp</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/students/${s._id}`)}>
                  <td className="td">
                    <img src={s.photoUrl?.startsWith("http") ? s.photoUrl : `${API_URL}${s.photoUrl}`} alt={s.name} className="w-9 h-9 rounded-full object-cover bg-gray-100" />
                  </td>
                  <td className="td font-mono text-xs">{s.registrationNumber}</td>
                  <td className="td font-medium">{s.name}</td>
                  <td className="td">{s.fatherName}</td>
                  <td className="td">{s.class}</td>
                  <td className="td">{s.rollNumber}</td>
                  <td className="td">{s.fatherWhatsapp}</td>
                  <td className="td" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/students/${s._id}`} className="btn-secondary btn-sm" title="View"><Eye size={14} /></Link>
                      <Link to={`/students/${s._id}/edit`} className="btn-secondary btn-sm" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(s)}><Trash2 size={14} /></button>
                      <WhatsAppButton phone={s.fatherWhatsapp} message={`Assalam-o-Alaikum, this is regarding your child ${s.name} at Al-Maarif Education.`} label="" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? "bg-primary-700 text-white" : "bg-white border border-gray-200"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this student?"
        message={`This will permanently delete ${deleteTarget?.name} and all linked attendance, fee and result records.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
