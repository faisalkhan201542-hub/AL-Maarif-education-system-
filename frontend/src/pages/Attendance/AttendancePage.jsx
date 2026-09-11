import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Save, Download, ArrowUp, ArrowDown } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import WhatsAppDispatchQueue from "../../components/WhatsAppDispatchQueue.jsx";
import { CLASSES } from "../../utils/constants.js";
import ExportButtons from "../../components/ExportButtons.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const todayStr = () => new Date().toISOString().substring(0, 10);

export default function AttendancePage() {
  const [className, setClassName] = useState(CLASSES[0]);
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [dispatchItems, setDispatchItems] = useState([]);
  
  // Sorting state
  const [sortBy, setSortBy] = useState("rollNumber");
  const [sortDir, setSortDir] = useState("asc");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/attendance", { params: { class: className, date } });
      setRows(res.data);
    } catch (err) {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [className, date]); // eslint-disable-line

  const setStatus = (studentId, status) => {
    setRows((prev) => prev.map((r) => (r.student._id === studentId ? { ...r, status } : r)));
  };

  const markAll = (status) => setRows((prev) => prev.map((r) => ({ ...r, status })));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/api/attendance/bulk", {
        class: className,
        date,
        records: rows.filter((r) => r.status).map((r) => ({ studentId: r.student._id, status: r.status })),
      });
      toast.success("Attendance saved");
      load();

      if (data.absentStudents && data.absentStudents.length > 0) {
        if (window.confirm(`${data.absentStudents.length} students were marked absent. Would you like to send WhatsApp alerts to their parents now?`)) {
          const items = data.absentStudents.map(student => ({
            name: student.name,
            phone: student.fatherWhatsapp,
            message: `Assalam-o-Alaikum, this is an automated alert from Al-Maarif Education. Your child, ${student.name} (Reg: ${student.registrationNumber}), is absent today (${date}). Please ensure they attend school regularly.`
          }));
          setDispatchItems(items);
          setQueueOpen(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const exportColumns = [
    { header: "Roll Number", key: "rollNumber", render: (r) => r.student?.rollNumber },
    { header: "Name", key: "name", render: (r) => r.student?.name },
    { header: "WhatsApp", key: "whatsapp", render: (r) => r.student?.fatherWhatsapp },
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

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "status") {
        aVal = a.status || "";
        bVal = b.status || "";
      } else if (sortBy === "name") {
        aVal = a.student.name || "";
        bVal = b.student.name || "";
      } else if (sortBy === "rollNumber") {
        aVal = a.student.rollNumber || 0;
        bVal = b.student.rollNumber || 0;
      }
      
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortBy, sortDir]);

  const statusBtnClass = (current, target) =>
    `px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
      current === target
        ? target === "Present" ? "bg-green-600 text-white border-green-600 dark:bg-green-600 dark:border-green-600"
        : target === "Absent" ? "bg-red-600 text-white border-red-600 dark:bg-red-600 dark:border-red-600"
        : "bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-600 dark:border-yellow-600"
        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-700"
    }`;

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Attendance"
        subtitle="Mark and manage daily student attendance"
        className="from-emerald-500 via-green-500 to-teal-500"
        rightElement={
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <ExportButtons 
              data={sortedRows} 
              columns={exportColumns} 
              title={`Attendance Report - ${className}`} 
              filename={`Attendance_${className}_${date}`} 
            />
            <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 border-none font-bold" onClick={handleSave} disabled={saving}>
              <Save size={16}/> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      />

      <div className="card flex flex-col sm:flex-row gap-3 sm:items-center">
        <div>
          <label className="label">Class</label>
          <select className="input" value={className} onChange={(e) => setClassName(e.target.value)}>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex gap-2 sm:ml-auto sm:self-end">
          <button className="btn-secondary btn-sm" onClick={() => markAll("Present")}>Mark All Present</button>
          <button className="btn-secondary btn-sm" onClick={() => markAll("Absent")}>Mark All Absent</button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? <Loader /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Photo</th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("rollNumber")}>
                  Roll <SortIcon field="rollNumber" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("name")}>
                  Name <SortIcon field="name" />
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 select-none" onClick={() => handleSort("status")}>
                  Status <SortIcon field="status" />
                </th>
                <th className="th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedRows.map((r) => (
                <tr key={r.student._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                  <td className="td"><img src={r.student.photoUrl?.startsWith("http") ? r.student.photoUrl : `${API_URL}${r.student.photoUrl}`} className="w-8 h-8 rounded-full object-cover bg-slate-100 dark:bg-slate-800" alt="" /></td>
                  <td className="td font-semibold">{r.student.rollNumber}</td>
                  <td className="td font-medium text-slate-800 dark:text-slate-200">{r.student.name}</td>
                  <td className="td">
                    <div className="flex gap-1.5">
                      {["Present", "Absent", "Leave"].map((s) => (
                        <button key={s} className={statusBtnClass(r.status, s)} onClick={() => setStatus(r.student._id, s)}>{s}</button>
                      ))}
                    </div>
                  </td>
                  <td className="td text-right">
                    {r.status === "Absent" && (
                      <div className="flex justify-end">
                        <WhatsAppButton
                          phone={r.student.fatherWhatsapp}
                          message={`🔔 *Al-Maarif Education (Ghair Hazri Alert)*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ka bacha/bachi *${r.student.name}* aaj school mein ghair-hazir (absent) hai.\nBaraye meharbani bache ki ghair hazri ki wajah se school intizamiya ko aagah karein.\n\nShukriya!`}
                          label="WhatsApp Father"
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <WhatsAppDispatchQueue 
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        items={dispatchItems}
        title="Absent Alerts Queue"
      />
    </div>
  );
}
