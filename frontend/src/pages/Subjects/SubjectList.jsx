import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Edit } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import toast from "react-hot-toast";

const CLASSES = ["KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
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

export default function SubjectList() {
  const [subjects, setSubjects] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("KG");
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", teacher: "", schedule: [] });

  const fetchSubjects = async (cls) => {
    try {
      const { data } = await api.get(`/api/subjects?class=${cls}`);
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to fetch subjects");
      setSubjects([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/api/teachers');
      setTeachers(data);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchSubjects(selectedClass);
  }, [selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Subject name is required");

    try {
      if (editId) {
        await api.put(`/api/subjects/${editId}`, { ...form, class: selectedClass });
        toast.success("Subject updated");
      } else {
        await api.post("/api/subjects", { ...form, class: selectedClass });
        toast.success("Subject added");
      }
      setShowModal(false);
      fetchSubjects(selectedClass);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving subject");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subject and its timetable?")) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      toast.success("Subject deleted");
      fetchSubjects(selectedClass);
    } catch (err) {
      toast.error("Error deleting subject");
    }
  };

  const openModal = async (subject = null) => {
    if (subject) {
      setEditId(subject._id);
      setForm({ name: subject.name, teacher: subject.teacher?._id || subject.teacher || "", schedule: [] });
      setShowModal(true);
      
      try {
        const { data } = await api.get(`/api/subjects/${subject._id}/schedule`);
        setForm(prev => ({ ...prev, schedule: data }));
      } catch (err) {
        console.error("Failed to load schedule");
      }
    } else {
      setEditId(null);
      setForm({ name: "", teacher: "", schedule: [] });
      setShowModal(true);
    }
  };

  const addScheduleSlot = () => {
    setForm({
      ...form,
      schedule: [...form.schedule, { day: "Monday", periodNumber: 1, startTime: DEFAULT_TIMES[1].start, endTime: DEFAULT_TIMES[1].end }]
    });
  };

  const updateScheduleSlot = (index, field, value) => {
    const updated = [...form.schedule];
    updated[index][field] = value;
    
    // Auto-update times if period number changes
    if (field === "periodNumber") {
      const times = DEFAULT_TIMES[value];
      if (times) {
        updated[index].startTime = times.start;
        updated[index].endTime = times.end;
      }
    }
    
    setForm({ ...form, schedule: updated });
  };

  const removeScheduleSlot = (index) => {
    const updated = form.schedule.filter((_, i) => i !== index);
    setForm({ ...form, schedule: updated });
  };

  if (!subjects) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
          <p className="text-sm text-gray-400">Manage subjects and automate their timetables</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="btn-secondary no-print">Print PDF</button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Subject
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium text-gray-600">Select Class:</label>
          <select
            className="input w-48"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left py-2 border-b">Subject Name</th>
                <th className="text-left py-2 border-b">Assigned Teacher</th>
                <th className="text-right py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub) => (
                <tr key={sub._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary-500" />
                    <span className="font-medium text-gray-700">{sub.name}</span>
                  </td>
                  <td className="py-3 text-gray-600">{sub.teacher?.name || sub.teacher || "-"}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => openModal(sub)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded mr-2">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(sub._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-400">No subjects found for this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editId ? "Edit Subject" : "Add Subject"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Subject Name *</label>
                  <input
                    required
                    className="input"
                    placeholder="e.g. Mathematics"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Assigned Teacher *</label>
                  <select 
                    required
                    className="input" 
                    value={form.teacher} 
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="label mb-0">Timetable Schedule</label>
                  <button type="button" onClick={addScheduleSlot} className="btn-secondary text-xs py-1 px-2">
                    <Plus size={14} className="inline mr-1" /> Add Slot
                  </button>
                </div>
                
                {form.schedule.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No schedule slots added. This subject will not appear on the timetable.</p>
                ) : (
                  <div className="space-y-3">
                    {form.schedule.map((slot, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <select className="input text-sm flex-1 min-w-[100px]" value={slot.day} onChange={(e) => updateScheduleSlot(index, "day", e.target.value)}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-500">Period</span>
                          <input type="number" min="1" className="input text-sm w-16" value={slot.periodNumber} onChange={(e) => updateScheduleSlot(index, "periodNumber", Number(e.target.value))} />
                        </div>
                        <input className="input text-sm w-28" placeholder="Start" value={slot.startTime} onChange={(e) => updateScheduleSlot(index, "startTime", e.target.value)} />
                        <input className="input text-sm w-28" placeholder="End" value={slot.endTime} onChange={(e) => updateScheduleSlot(index, "endTime", e.target.value)} />
                        <button type="button" onClick={() => removeScheduleSlot(index)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
