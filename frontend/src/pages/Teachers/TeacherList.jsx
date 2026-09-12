import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import ExportButtons from "../../components/ExportButtons.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

export default function TeacherList() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sorting state
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/teachers", { params: { search, sortBy, sortDir } });
      setTeachers(res.data);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [sortBy, sortDir]); // eslint-disable-line

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

  const exportColumns = [
    { header: "Teacher ID", key: "teacherId" },
    { header: "Name", key: "name" },
    { header: "Subject", key: "subject" },
    { header: "Class", key: "assignedClass" },
    { header: "Phone", key: "phone" },
    { header: "WhatsApp", key: "whatsapp" },
    { header: "Qualification", key: "qualification" },
    { header: "Base Salary", key: "baseSalary" },
    { header: "Status", key: "status" }
  ];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === "asc" ? <ArrowUp size={14} className="inline ml-1" /> : <ArrowDown size={14} className="inline ml-1" />;
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Teachers"
        subtitle="Manage teaching staff and assign classes"
        rightElement={
          <div className="flex items-center gap-2">
            <ExportButtons 
              data={teachers} 
              columns={exportColumns} 
              title="Teachers Roster" 
              filename="Teachers_List" 
            />
            <button className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors" onClick={() => navigate("/teachers/new")}>
              <Plus size={16}/> Add Teacher
            </button>
          </div>
        }
      />

      <div className="card">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                <th className="th">Photo</th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("teacherId")}>
                  Teacher ID <SortIcon field="teacherId" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("name")}>
                  Name <SortIcon field="name" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("subject")}>
                  Subject <SortIcon field="subject" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("assignedClass")}>
                  Class <SortIcon field="assignedClass" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("phone")}>
                  Phone <SortIcon field="phone" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("baseSalary")}>
                  Base Salary <SortIcon field="baseSalary" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("status")}>
                  Status <SortIcon field="status" />
                </th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {teachers.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                  <td className="td"><img src={t.photoUrl?.startsWith("http") ? t.photoUrl : `${API_URL}${t.photoUrl}`} className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800" alt={t.name} /></td>
                  <td className="td font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{t.teacherId}</td>
                  <td className="td font-medium text-slate-800 dark:text-slate-200">{t.name}</td>
                  <td className="td">{t.subject}</td>
                  <td className="td"><span className="badge-gray">{t.assignedClass || "-"}</span></td>
                  <td className="td">{t.phone}</td>
                  <td className="td font-semibold text-slate-700 dark:text-slate-300">Rs {t.baseSalary?.toLocaleString() || 0}</td>
                  <td className="td"><span className="badge-green">{t.status}</span></td>
                  <td className="td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/teachers/${t._id}/edit`} className="btn-secondary btn-sm" title="Edit"><Pencil size={14}/></Link>
                      <button className="btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(t)}><Trash2 size={14}/></button>
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
