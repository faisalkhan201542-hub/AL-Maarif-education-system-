import { useState } from "react";
import toast from "react-hot-toast";
import { FileSpreadsheet, FileText, Users, CalendarCheck, Wallet, Award, UserCog } from "lucide-react";
import api from "../../api/axios.js";
import { CLASSES } from "../../utils/constants.js";

const reportSections = [
  { key: "students", label: "Student Reports", icon: Users, filters: ["class"] },
  { key: "attendance", label: "Attendance Reports", icon: CalendarCheck, filters: ["class"] },
  { key: "fees", label: "Fee Reports", icon: Wallet, filters: ["class", "status"] },
  { key: "results", label: "Result Reports", icon: Award, filters: ["class"] },
  { key: "teachers", label: "Teacher Reports", icon: UserCog, filters: [] },
];

export default function Reports() {
  const [filters, setFilters] = useState({});

  const updateFilter = (key, field, value) => setFilters((f) => ({ ...f, [key]: { ...f[key], [field]: value } }));

  const handleExport = async (key, format) => {
    try {
      const params = filters[key] || {};
      const res = await api.get(`/api/reports/${key}/${format}`, { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = format === "excel" ? "xlsx" : "docx";
      link.setAttribute("download", `${key.charAt(0).toUpperCase() + key.slice(1)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${key} report exported (${format})`);
    } catch (err) {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-400">Generate and export professional reports (Excel / Word) — Al-Maarif Education</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reportSections.map(({ key, label, icon: Icon, filters: filterFields }) => (
          <div key={key} className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center"><Icon size={18}/></div>
              <h2 className="font-semibold text-gray-700">{label}</h2>
            </div>

            {filterFields.includes("class") && (
              <select className="input mb-2" onChange={(e) => updateFilter(key, "class", e.target.value)} defaultValue="">
                <option value="">All Classes</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {filterFields.includes("status") && (
              <select className="input mb-2" onChange={(e) => updateFilter(key, "status", e.target.value)} defaultValue="">
                <option value="">All Status</option>
                <option>Unpaid</option><option>Partial</option><option>Paid</option>
              </select>
            )}

            <div className="flex gap-2 mt-2">
              <button className="btn-secondary flex-1 justify-center" onClick={() => handleExport(key, "excel")}>
                <FileSpreadsheet size={16}/> Export Excel
              </button>
              <button className="btn-secondary flex-1 justify-center" onClick={() => handleExport(key, "word")}>
                <FileText size={16}/> Export Word
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
