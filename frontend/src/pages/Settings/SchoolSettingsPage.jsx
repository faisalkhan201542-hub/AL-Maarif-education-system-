import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { CLASSES } from "../../utils/constants.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SchoolSettingsPage() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
      if (settings.logoUrl) setLogoPreview(`${API_URL}${settings.logoUrl}`);
    }
  }, [settings]);

  if (!form) return <Loader />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFeeStructureChange = (className, value) => {
    setForm({
      ...form,
      feeStructure: {
        ...form.feeStructure,
        [className]: Number(value) || 0
      }
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (!["_id", "createdAt", "updatedAt", "__v", "logoUrl", "feeStructure"].includes(k) && v !== undefined) fd.append(k, v);
      });
      if (form.feeStructure) {
        fd.append("feeStructure", JSON.stringify(form.feeStructure));
      }
      if (logo) fd.append("logo", logo);
      await api.put("/api/settings", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Settings updated");
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">School Settings</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="flex items-center gap-4">
          <img src={logoPreview || "https://api.dicebear.com/7.x/shapes/svg?seed=school"} alt="logo" className="w-16 h-16 rounded-lg object-cover bg-gray-100 border" />
          <div>
            <label className="label">School Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">School Name</label><input name="schoolName" className="input" value={form.schoolName} onChange={handleChange} /></div>
          <div><label className="label">Academic Year</label><input name="academicYear" className="input" value={form.academicYear} onChange={handleChange} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input name="address" className="input" value={form.address} onChange={handleChange} /></div>
          <div><label className="label">Principal Name</label><input name="principalName" className="input" value={form.principalName} onChange={handleChange} /></div>
          <div><label className="label">Principal WhatsApp</label><input name="principalWhatsapp" className="input" value={form.principalWhatsapp} onChange={handleChange} /></div>
          <div><label className="label">School Phone</label><input name="schoolPhone" className="input" value={form.schoolPhone} onChange={handleChange} /></div>
          <div><label className="label">School Email</label><input name="schoolEmail" className="input" value={form.schoolEmail} onChange={handleChange} /></div>
          <div className="sm:col-span-2"><label className="label">Google Maps Link</label><input name="googleMapsLink" placeholder="https://maps.google.com/?q=..." className="input" value={form.googleMapsLink} onChange={handleChange} /></div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="font-semibold text-gray-700 mb-3">EasyPaisa Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="label">Account Number</label><input type="text" className="input" name="easypaisaNumber" value={form.easypaisaNumber} onChange={handleChange} /></div>
            <div><label className="label">Account Name</label><input type="text" className="input" name="easypaisaAccountName" value={form.easypaisaAccountName} onChange={handleChange} /></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Changing the EasyPaisa number here will apply to all newly generated fee challans.</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-gray-700 mb-3">Class-wise Base Fee Structure</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CLASSES.map(cls => (
              <div key={cls}>
                <label className="label text-xs">Class {cls}</label>
                <input 
                  type="number" 
                  className="input" 
                  value={form.feeStructure?.[cls] || ""} 
                  onChange={(e) => handleFeeStructureChange(cls, e.target.value)} 
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">These base amounts will automatically populate when generating fee challans.</p>
        </div>

        <div className="flex justify-end pt-4 border-t mt-6">
          <button type="submit" disabled={saving} className="btn-primary px-6"><Save size={16}/> {saving ? "Saving..." : "Save Settings"}</button>
        </div>
      </form>
    </div>
  );
}
