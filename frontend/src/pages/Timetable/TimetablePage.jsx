import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Printer } from "lucide-react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

const CLASSES = ["KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("KG");
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day: "Monday", periodNumber: 1, subject: "", teacher: "", startTime: "", endTime: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/timetable?class=${selectedClass}`);
      setTimetable(res.data);
    } catch (err) {
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/timetable/${editingId}`, form);
        toast.success("Period updated");
      } else {
        await api.post("/api/timetable", { ...form, class: selectedClass });
        toast.success("Period added");
      }
      setShowForm(false);
      setEditingId(null);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save period");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/timetable/${id}`);
      toast.success("Period deleted");
      fetchTimetable();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openForm = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        day: item.day,
        periodNumber: item.periodNumber,
        subject: item.subject,
        teacher: item.teacher,
        startTime: item.startTime,
        endTime: item.endTime,
      });
    } else {
      setEditingId(null);
      setForm({ day: "Monday", periodNumber: 1, subject: "", teacher: "", startTime: "", endTime: "" });
    }
    setShowForm(true);
  };

  // Group by day
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day).sort((a, b) => a.periodNumber - b.periodNumber);
    return acc;
  }, {});

  const maxPeriods = Math.max(1, ...timetable.map(t => t.periodNumber), 8); // default to at least 8 columns
  const periodsArray = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return (
    <div className="space-y-6 print-area">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Class Timetable</h1>
          <p className="text-sm text-gray-500">Manage daily schedules for each class in a clean table format.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="input max-w-xs bg-white shadow-sm"
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
          >
            {CLASSES.map(c => <option key={c} value={c}>{c} Class</option>)}
          </select>
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={18} /> Print PDF
          </button>
          <button onClick={() => openForm()} className="btn-primary">
            <Plus size={18} /> Add Period
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card bg-primary-50/50 border-primary-100">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Period" : "Add Period"} for {selectedClass}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Day</label>
              <select className="input" value={form.day} onChange={e => setForm({...form, day: e.target.value})}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Period Number</label>
              <input type="number" min="1" required className="input" value={form.periodNumber} onChange={e => setForm({...form, periodNumber: Number(e.target.value)})} />
            </div>
            <div>
              <label className="label">Subject</label>
              <input required className="input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div>
              <label className="label">Teacher</label>
              <input required className="input" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} />
            </div>
            <div>
              <label className="label">Start Time (e.g. 08:00 AM)</label>
              <input required className="input" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            </div>
            <div>
              <label className="label">End Time (e.g. 08:45 AM)</label>
              <input required className="input" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Period</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading timetable...</p>
      ) : (
        <div className="card p-0 overflow-x-auto shadow-sm border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-primary-600 to-primary-500">
                <th className="p-4 border-b border-primary-700/30 text-white font-bold text-center w-32 shadow-sm rounded-tl-xl">
                  Day / Period
                </th>
                {periodsArray.map(p => (
                  <th key={p} className="p-4 border-b border-primary-700/30 text-center font-bold text-white shadow-sm last:rounded-tr-xl">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="border-b last:border-b-0 hover:bg-primary-50/20 transition-colors">
                  <td className="p-4 border-r border-gray-100 font-bold text-primary-700 bg-primary-50/50 text-center uppercase tracking-wide text-sm shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)]">
                    {day}
                  </td>
                  {periodsArray.map(p => {
                    const period = grouped[day]?.find(t => t.periodNumber === p);
                    return (
                      <td key={p} className="p-2 border-r border-gray-100 relative group align-top min-w-[160px] h-28">
                        {period ? (
                          <div className="h-full w-full bg-white rounded-lg p-3 border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center transition-all hover:shadow-md hover:border-primary-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-lg"></div>
                            <p className="font-bold text-gray-800 leading-tight">{period.subject}</p>
                            <p className="text-xs font-medium text-gray-500 mt-1">{period.teacher}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-medium">
                              {period.startTime} - {period.endTime}
                            </span>
                            
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button onClick={() => openForm(period)} className="p-2 bg-primary-100 rounded-full text-primary-700 hover:bg-primary-600 hover:text-white hover:shadow-md transition-all">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(period._id)} className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md transition-all">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-gray-200 text-sm font-medium">-</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

