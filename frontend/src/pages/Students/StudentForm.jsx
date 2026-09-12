import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { CLASSES, GENDERS, STUDENT_STATUS } from "../../utils/constants.js";
import Loader from "../../components/Loader.jsx";
import { compressImage } from "../../utils/imageCompressor.js";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

const empty = {
  registrationNumber: "", admissionNumber: "", name: "", fatherName: "", fatherWhatsapp: "", parentContact: "",
  gender: "Male", dob: "", address: "", class: CLASSES[0], rollNumber: "",
  admissionDate: "", status: "Active",
};

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/students/${id}`).then((res) => {
        const s = res.data;
        setForm({
          ...s,
          dob: s.dob ? s.dob.substring(0, 10) : "",
          admissionDate: s.admissionDate ? s.admissionDate.substring(0, 10) : "",
        });
        setPreview(s.photoUrl?.match(/^(http|data:)/) ? s.photoUrl : `${API_URL}${s.photoUrl}`);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      const base64 = await compressImage(file);
      setPhoto(base64);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (photo) payload.photoBase64 = photo;

      if (isEdit) {
        await api.put(`/api/students/${id}`, payload);
        toast.success("Student updated");
      } else {
        const res = await api.post("/api/students", payload);
        toast.success(`Student added — Registration No: ${res.data.registrationNumber}`);
      }
      navigate("/students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{isEdit ? "Edit Student" : "Add Student"}</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="flex items-center gap-4">
          <img src={preview || "https://api.dicebear.com/7.x/adventurer/svg?seed=new"} alt="preview" className="w-20 h-20 rounded-full object-cover bg-slate-100 dark:bg-slate-800 border" />
          <div>
            <label className="label">Student Photo</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Registration Number</label>
            <input name="registrationNumber" placeholder="Auto-generated if left blank" className="input" value={form.registrationNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Admission / Reg. Entry No.</label>
            <input name="admissionNumber" placeholder="Auto-generated if left blank" className="input" value={form.admissionNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Student Name *</label>
            <input name="name" required className="input" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Father Name *</label>
            <input name="fatherName" required className="input" value={form.fatherName} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Father WhatsApp Number *</label>
            <input name="fatherWhatsapp" required placeholder="+923XXXXXXXXX" className="input" value={form.fatherWhatsapp} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Parent Contact (optional)</label>
            <input name="parentContact" className="input" value={form.parentContact} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Gender *</label>
            <select name="gender" required className="input" value={form.gender} onChange={handleChange}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date of Birth *</label>
            <input type="date" name="dob" required className="input" value={form.dob} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Class *</label>
            <select name="class" required className="input" value={form.class} onChange={handleChange}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Roll Number *</label>
            <input type="number" name="rollNumber" required min={1} className="input" value={form.rollNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Admission Date</label>
            <input type="date" name="admissionDate" className="input" value={form.admissionDate} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={form.status} onChange={handleChange}>
              {STUDENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea name="address" rows={2} className="input" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Student"}</button>
        </div>
      </form>
    </div>
  );
}
