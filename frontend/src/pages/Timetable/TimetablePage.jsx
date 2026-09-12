import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit, X, UserSearch } from "lucide-react";
import api from "../../api/axios.js";
import toast from "react-hot-toast";
import PageHeader from "../../components/PageHeader.jsx";
import { CLASSES } from "../../utils/constants.js";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_TIMES = {
  1: { start: "08:00 AM", end: "08:45 AM" },
  2: { start: "08:45 AM", end: "09:30 AM" },
  3: { start: "09:30 AM", end: "10:15 AM" },
  4: { start: "10:15 AM", end: "11:00 AM" },
  5: { start: "11:00 AM", end: "11:45 AM" },
  6: { start: "11:45 AM", end: "12:30 PM" },
  7: { start: "12:30 PM", end: "01:15 PM" },
  8: { start: "01:15 PM", end: "02:00 PM" }
};

const LEGEND = [
  { label: "Language / Urdu / English", dot: "bg-[#4a789c]" },
  { label: "Maths", dot: "bg-[#558b5e]" },
  { label: "Islamiyat / Nazira", dot: "bg-[#7c57a5]" },
  { label: "Science / G.K", dot: "bg-[#b37747]" },
  { label: "Drawing / Rhyming", dot: "bg-[#ab4b6d]" },
  { label: "Break", dot: "bg-[#b28e46]" },
];

const getSubjectColor = (subject) => {
  if (!subject) return 'bg-transparent text-slate-800 dark:text-slate-100';
  const s = subject.toLowerCase();
  if (s.includes('urdu') || s.includes('english') || s.includes('language') || s.includes('qaida') || s.includes('rhyming')) 
    return 'bg-[#e8f1f7] text-[#4a789c]'; 
  if (s.includes('math')) 
    return 'bg-[#eef5ec] text-[#558b5e]'; 
  if (s.includes('islam') || s.includes('nazira') || s.includes('hifz') || s.includes('nisab') || s.includes('quran')) 
    return 'bg-[#f3ebf8] text-[#7c57a5]'; 
  if (s.includes('science') || s.includes('g.k') || s.includes('history') || s.includes('arabic')) 
    return 'bg-[#fdf1e4] text-[#b37747]'; 
  if (s.includes('draw') || s.includes('art')) 
    return 'bg-[#faeaef] text-[#ab4b6d]'; 
  if (s.includes('break')) 
    return 'bg-[#fdf6e1] text-[#b28e46]'; 
  return 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700'; 
};

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [allTimetable, setAllTimetable] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day: "Monday", class: CLASSES[0], periodNumber: 1, subject: "", teacher: "", startTime: "08:00 AM", endTime: "08:45 AM"
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeachers();
    fetchTimetable();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/api/teachers');
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/timetable`);
      setAllTimetable(res.data);
    } catch (err) {
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (num) => {
    const times = DEFAULT_TIMES[num] || { start: "", end: "" };
    setForm({ ...form, periodNumber: num, startTime: times.start, endTime: times.end });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/timetable/${editingId}`, form);
        toast.success("Period updated");
      } else {
        await api.post("/api/timetable", form);
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
      toast.success("Period removed");
      fetchTimetable();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  const handleEdit = (period) => {
    setForm({
      day: period.day,
      class: period.class,
      periodNumber: period.periodNumber,
      subject: period.subject,
      teacher: period.teacher?._id || period.teacher || "",
      startTime: period.startTime,
      endTime: period.endTime
    });
    setEditingId(period._id);
    setShowForm(true);
  };

  // Helper to get period data for a specific class and period number on the selected day
  const getPeriodData = (cls, periodNum) => {
    return allTimetable.find(t => t.day === selectedDay && t.class === cls && t.periodNumber === periodNum);
  };

  const openForm = (item = null, cls = CLASSES[0], periodNum = 1) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        day: item.day,
        class: item.class,
        periodNumber: item.periodNumber,
        subject: item.subject,
        teacher: item.teacher?._id || item.teacher || "",
        startTime: item.startTime,
        endTime: item.endTime,
      });
    } else {
      setEditingId(null);
      const times = DEFAULT_TIMES[periodNum] || { start: "08:00 AM", end: "08:45 AM" };
      setForm({ 
        day: selectedDay, 
        class: cls, 
        periodNumber: periodNum, 
        subject: "", 
        teacher: "", 
        startTime: times.start, 
        endTime: times.end 
      });
    }
    setShowForm(true);
  };

  const currentDailyTimetable = allTimetable.filter(t => t.day === selectedDay);

  const renderDailyMatrix = () => {
    const maxPeriods = Math.max(1, ...currentDailyTimetable.map(t => t.periodNumber), 8); 
    const periodsArray = Array.from({ length: maxPeriods }, (_, i) => i + 1);

    return (
      <div className="w-full overflow-x-auto border border-[#e5e7eb] rounded-xl shadow-sm bg-white dark:bg-slate-800">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr>
              <th className="p-4 bg-[#2c405a] text-white font-semibold text-center border-b border-r border-[#1a2b42] sticky left-0 z-20 w-32 shadow-[1px_0_0_0_#1a2b42]">
                Time
              </th>
              {CLASSES.map(cls => (
                <th key={cls} className="p-4 bg-[#2c405a] text-white font-semibold text-center border-b border-r border-[#1a2b42] min-w-[160px]">
                  {cls}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodsArray.map((p) => {
              const timeSlot = DEFAULT_TIMES[p] || { start: "", end: "" };
              return (
                <tr key={p} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50/50 transition-colors">
                  <td className="p-3 bg-[#f8f9fa] border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 text-center text-sm sticky left-0 z-10 whitespace-nowrap shadow-[1px_0_0_0_#e5e7eb]">
                    {timeSlot.start}<br/><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal">to</span><br/>{timeSlot.end}
                  </td>
                  
                  {CLASSES.map(cls => {
                    const period = currentDailyTimetable.find(t => t.periodNumber === p && t.class === cls);
                    
                    return (
                      <td key={cls} className="p-2 border-b border-r border-slate-100 dark:border-slate-700 align-middle">
                        {period ? (
                          <div className={`w-full h-full min-h-[75px] rounded p-2 flex flex-col justify-center items-center text-center transition-all relative group/cell ${getSubjectColor(period.subject)}`}>
                            <p className="font-bold text-sm leading-tight mb-1">{period.subject}</p>
                            <p className="text-xs font-medium opacity-80">{period.teacher?.name || period.teacher}</p>
                            
                            <div className="absolute inset-0 bg-white dark:bg-slate-800/95 backdrop-blur-[1px] opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded border border-slate-200 dark:border-slate-700">
                              <button onClick={() => openForm(period, cls, p)} className="p-1.5 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete(period._id)} className="p-1.5 bg-red-50 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-[75px] flex items-center justify-center relative group/cell rounded hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50 transition-colors">
                            <span className="text-gray-300 text-sm font-medium">-</span>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                               <button onClick={() => openForm(null, cls, p)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                 <Plus size={16} />
                               </button>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-full pb-10">
      
      {/* Title & Legend Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader 
          title="Class Timetable"
          subtitle="Play Group through Class 10th · 8:00 AM – 2:00 PM"
          className="from-[#2c405a] via-[#3d5a80] to-[#4a789c] mb-0"
        />
        <Link 
          to="/timetable/teacher" 
          className="btn-outline flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <UserSearch size={18} />
          Teacher View
        </Link>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">
          {LEGEND.map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${l.dot}`}></span>
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex justify-center overflow-x-auto pb-2">
        <div className="inline-flex bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-1.5 rounded-xl whitespace-nowrap">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                selectedDay === day 
                  ? 'bg-[#2c405a] text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-6 border border-[#2c405a]/10 relative">
          <button 
            onClick={() => setShowForm(false)} 
            className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold text-[#2c405a] mb-6">{editingId ? "Edit Period" : "Add Period"}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Day</label>
              <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" value={form.day} onChange={e => setForm({...form, day: e.target.value})}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Class</label>
              <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" value={form.class} onChange={e => setForm({...form, class: e.target.value})}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Period Number</label>
              <input type="number" min="1" required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" value={form.periodNumber} onChange={e => handlePeriodChange(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" placeholder="e.g. Maths" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" 
                value={form.teacher} 
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              >
                <option value="">Select a Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" placeholder="08:00 AM" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 focus:ring-2 focus:ring-[#2c405a] focus:border-transparent transition-all outline-none" placeholder="08:45 AM" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-[#2c405a] text-white hover:bg-[#1a2b42] rounded-lg font-medium shadow-sm transition-colors">
                Save Period
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 animate-pulse font-medium text-lg">Loading timetable...</p>
        </div>
      ) : (
        renderDailyMatrix()
      )}
    </div>
  );
}
