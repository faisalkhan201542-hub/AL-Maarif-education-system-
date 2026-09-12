import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { CLASSES } from "../../utils/constants.js";
import { compressImage } from "../../utils/imageCompressor.js";

const empty = { name: "", phone: "", whatsapp: "", qualification: "", subject: "", baseSalary: 0, joiningDate: "", assignedClass: "", status: "Active" };

export default function TeacherForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/teachers/${id}`).then((res) => {
        const t = res.data;
        setForm({
          ...t,
          joiningDate: t.joiningDate ? t.joiningDate.substring(0, 10) : "",
        });
        setPreview(t.photoUrl?.match(/^(http|data:)/) ? t.photoUrl : `${API_URL}${t.photoUrl}`);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setCompressing(true);
        setPreview(URL.createObjectURL(file));
        const base64 = await compressImage(file);
        setPhoto(base64);
      } catch (err) {
        console.error("Photo compression error:", err);
        toast.error("Failed to process photo. Please try a different image.");
      } finally {
        setCompressing(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (compressing) {
      toast.error("Please wait, photo is still being processed...");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (photo) payload.photoBase64 = photo;

      if (isEdit) {
        await api.put(`/api/teachers/${id}`, payload);
        toast.success("Teacher updated");
      } else {
        await api.post("/api/teachers", payload);
        toast.success("Teacher added");
      }
      navigate("/teachers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save teacher");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEdit ? "Edit Teacher" : "Add Teacher"}</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Photo</label>
          <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Name *</label><input name="name" required className="input" value={form.name} onChange={handleChange} /></div>
          <div><label className="label">Phone *</label><input name="phone" required className="input" value={form.phone} onChange={handleChange} /></div>
          <div><label className="label">WhatsApp *</label><input name="whatsapp" required className="input" value={form.whatsapp} onChange={handleChange} /></div>
          <div><label className="label">Qualification</label><input name="qualification" className="input" value={form.qualification} onChange={handleChange} /></div>
          <div><label className="label">Subject</label><input name="subject" className="input" value={form.subject} onChange={handleChange} /></div>
          <div><label className="label">Base Salary</label><input type="number" name="baseSalary" className="input" value={form.baseSalary} onChange={handleChange} /></div>
          <div>
            <label className="label">Assigned Class</label>
            <select name="assignedClass" className="input" value={form.assignedClass} onChange={handleChange}>
              <option value="">Unassigned</option>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Joining Date</label><input type="date" name="joiningDate" className="input" value={form.joiningDate} onChange={handleChange} /></div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={form.status} onChange={handleChange}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onClick={() => navigate("/teachers")} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving || compressing} className="btn-primary">
            {saving ? "Saving..." : compressing ? "Processing Photo..." : "Save Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
}
