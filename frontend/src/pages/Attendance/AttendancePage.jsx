import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import { CLASSES } from "../../utils/constants.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const todayStr = () => new Date().toISOString().substring(0, 10);

export default function AttendancePage() {
  const [className, setClassName] = useState(CLASSES[0]);
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/attendance", { params: { class: className, date } });
    setRows(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [className, date]); // eslint-disable-line

  const setStatus = (studentId, status) => {
    setRows((prev) => prev.map((r) => (r.student._id === studentId ? { ...r, status } : r)));
  };

  const markAll = (status) => setRows((prev) => prev.map((r) => ({ ...r, status })));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/api/attendance/bulk", {
        class: className,
        date,
        records: rows.filter((r) => r.status).map((r) => ({ studentId: r.student._id, status: r.status })),
      });
      toast.success("Attendance saved");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const statusBtnClass = (current, target) =>
    `px-2.5 py-1 rounded-md text-xs font-medium border ${
      current === target
        ? target === "Present" ? "bg-green-600 text-white border-green-600"
        : target === "Absent" ? "bg-red-600 text-white border-red-600"
        : "bg-yellow-500 text-white border-yellow-500"
        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary"><Save size={16}/> {saving ? "Saving..." : "Save Attendance"}</button>
      </div>

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
              <tr><th className="th">Photo</th><th className="th">Roll</th><th className="th">Name</th><th className="th">Status</th><th className="th">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.student._id}>
                  <td className="td"><img src={r.student.photoUrl?.startsWith("http") ? r.student.photoUrl : `${API_URL}${r.student.photoUrl}`} className="w-8 h-8 rounded-full object-cover" alt="" /></td>
                  <td className="td">{r.student.rollNumber}</td>
                  <td className="td font-medium">{r.student.name}</td>
                  <td className="td">
                    <div className="flex gap-1.5">
                      {["Present", "Absent", "Leave"].map((s) => (
                        <button key={s} className={statusBtnClass(r.status, s)} onClick={() => setStatus(r.student._id, s)}>{s}</button>
                      ))}
                    </div>
                  </td>
                  <td className="td">
                    {r.status === "Absent" && (
                      <WhatsAppButton
                        phone={r.student.fatherWhatsapp}
                        message={`Assalam-o-Alaikum, your child was absent from Al-Maarif Education today.`}
                        label="WhatsApp Father"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
