import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Plus, Eye, Pencil, Trash2, Download, ArrowUp, ArrowDown, Printer } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { CLASSES } from "../../utils/constants.js";
import ExportButtons from "../../components/ExportButtons.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

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
  const [exporting, setExporting] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/students", { 
        params: { search, class: className, page, limit: 20, sortBy, sortDir } 
      });
      setStudents(res.data.students);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, className, sortBy, sortDir]);

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

  const fetchDataForExport = async () => {
    try {
      const res = await api.get("/api/students", { 
        params: { search, class: className, limit: 2000, sortBy, sortDir } 
      });
      return res.data.students;
    } catch (err) {
      toast.error("Failed to fetch data for export");
      return [];
    }
  };

  const exportColumns = [
    { header: "Reg No", key: "registrationNumber" },
    { header: "Name", key: "name" },
    { header: "Father Name", key: "fatherName" },
    { header: "Class", key: "class" },
    { header: "Roll No", key: "rollNumber" },
    { header: "Gender", key: "gender" },
    { header: "WhatsApp", key: "fatherWhatsapp" },
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
        title="Students"
        subtitle={`${total} students found`}
        rightElement={
          <div className="flex items-center gap-2">
            <ExportButtons 
              fetchData={fetchDataForExport} 
              columns={exportColumns} 
              title={`Students List ${className ? `(${className})` : "(All Classes)"}`}
              filename={`Students_${className || "All"}`} 
            />
            <button 
              className="btn-secondary flex items-center gap-2" 
              title="Print ID Cards for current filter"
              onClick={() => navigate(`/students/id-cards/bulk?class=${encodeURIComponent(className)}&search=${encodeURIComponent(search)}`)}
            >
              <Printer size={16} /> ID Cards
            </button>
            <button 
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm font-bold flex items-center gap-2 transition-colors" 
              onClick={() => navigate("/students/new")}
            >
              <Plus size={16} /> Add Student
            </button>
          </div>
        }
      />

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("registrationNumber")}>
                  Reg. No <SortIcon field="registrationNumber" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("name")}>
                  Name <SortIcon field="name" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("fatherName")}>
                  Father Name <SortIcon field="fatherName" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("class")}>
                  Class <SortIcon field="class" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("rollNumber")}>
                  Roll No <SortIcon field="rollNumber" />
                </th>
                <th className="th">WhatsApp</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/students/${s._id}`)}>
                  <td className="td">
                    <img src={s.photoUrl?.match(/^(http|data:)/) ? s.photoUrl : `${API_URL}${s.photoUrl}`} alt={s.name} className="w-9 h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800" />
                  </td>
                  <td className="td font-mono text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{s.registrationNumber}</td>
                  <td className="td font-medium text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="td">{s.fatherName}</td>
                  <td className="td">
                    <span className="badge-gray">{s.class}</span>
                  </td>
                  <td className="td font-semibold">{s.rollNumber}</td>
                  <td className="td">{s.fatherWhatsapp}</td>
                  <td className="td text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/students/${s._id}`} className="btn-secondary btn-sm" title="View"><Eye size={14} /></Link>
                      <Link to={`/students/${s._id}/edit`} className="btn-secondary btn-sm" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn-danger btn-sm" title="Delete" onClick={() => setDeleteTarget(s)}><Trash2 size={14} /></button>
                      <WhatsAppButton phone={s.fatherWhatsapp} message={`Assalam-o-Alaikum!\nMohtaram Walidain, ye paigham Al-Maarif Education ki janib se aap ke bache ${s.name} ke mutaliq hai.`} label="" />
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
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? "bg-primary-700 text-white" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-700"}`}>
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
