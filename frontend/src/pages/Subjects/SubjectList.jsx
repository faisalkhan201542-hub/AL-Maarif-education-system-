import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Edit } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import toast from "react-hot-toast";

const CLASSES = ["KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];

export default function SubjectList() {
  const [subjects, setSubjects] = useState(null);
  const [selectedClass, setSelectedClass] = useState("KG");
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", teacher: "" });

  const fetchSubjects = async (cls) => {
    try {
      const { data } = await api.get(`/api/subjects?class=${cls}`);
      setSubjects(data);
    } catch (err) {
      toast.error("Failed to fetch subjects");
      setSubjects([]);
    }
  };

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
    if (!confirm("Delete this subject?")) return;
    try {
      await api.delete(`/api/subjects/${id}`);
      toast.success("Subject deleted");
      fetchSubjects(selectedClass);
    } catch (err) {
      toast.error("Error deleting subject");
    }
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditId(subject._id);
      setForm({ name: subject.name, teacher: subject.teacher || "" });
    } else {
      setEditId(null);
      setForm({ name: "", teacher: "" });
    }
    setShowModal(true);
  };

  if (!subjects) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subject Management</h1>
          <p className="text-sm text-gray-400">Manage subjects and assigned teachers by class</p>
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
                  <td className="py-3 text-gray-600">{sub.teacher || "-"}</td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editId ? "Edit Subject" : "Add Subject"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                <label className="label">Assigned Teacher (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Mr. Ahmed"
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
