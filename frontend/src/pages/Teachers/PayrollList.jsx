import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Banknote, FileText, Printer, CheckCircle, Search } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { generateSalarySlipPDF } from "../../utils/salarySlipUtils.js";
import { useAuth } from "../../context/AuthContext.jsx";

const currentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function PayrollList() {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(currentMonthStr());
  const [search, setSearch] = useState("");
  
  // Modal state
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/api/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/payroll", { params: { month } });
      setPayrolls(res.data);
    } catch (err) {
      toast.error("Failed to load payrolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!settings) fetchSettings();
  }, [month]); // eslint-disable-line

  const filtered = payrolls.filter((p) => 
    p.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.teacher?.teacherId?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (p) => {
    setSelectedTeacher(p);
    setForm({
      baseSalary: p.baseSalary,
      allowances: p.allowances,
      deductions: p.deductions,
      advanceDeduction: p.advanceDeduction,
      remarks: p.remarks,
      status: p.status
    });
  };

  const closeModal = () => {
    setSelectedTeacher(null);
    setForm(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/payroll", {
        teacherId: selectedTeacher.teacher._id,
        month,
        ...form
      });
      toast.success("Payroll saved");
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save payroll");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (p) => {
    try {
      await api.post("/api/payroll", {
        teacherId: p.teacher._id,
        month,
        baseSalary: p.baseSalary,
        allowances: p.allowances,
        deductions: p.deductions,
        advanceDeduction: p.advanceDeduction,
        remarks: p.remarks,
        status: "Paid"
      });
      toast.success("Marked as Paid");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const printSlip = (p) => {
    if (p.status !== "Paid") {
      toast.error("Cannot print slip for pending salary");
      return;
    }
    generateSalarySlipPDF(p, settings);
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Staff Payroll"
        subtitle="Manage monthly salaries and slips"
      />

      <div className="card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="month" 
            className="input" 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
          />
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="input pl-9" 
              placeholder="Search teacher..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-x-auto">
        {loading ? <Loader /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Teacher ID</th>
                <th className="th">Name</th>
                <th className="th text-right">Base Salary</th>
                <th className="th text-right">Net Pay</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(p => (
                <tr key={p.teacher._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="td text-slate-500 font-mono text-xs">{p.teacher.teacherId}</td>
                  <td className="td font-medium text-slate-800 dark:text-slate-200">{p.teacher.name}</td>
                  <td className="td text-right">Rs {p.baseSalary?.toLocaleString()}</td>
                  <td className="td text-right font-bold text-slate-700 dark:text-slate-300">
                    Rs {p.netSalary?.toLocaleString()}
                  </td>
                  <td className="td">
                    <span className={p.status === "Paid" ? "badge-green" : "badge-orange"}>
                      {p.status}
                    </span>
                  </td>
                  <td className="td text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === "Pending" ? (
                        <>
                          <button className="btn-secondary btn-sm" onClick={() => openModal(p)}>
                            <FileText size={14} /> Process
                          </button>
                          <button className="btn-primary btn-sm" onClick={() => handleMarkPaid(p)}>
                            <CheckCircle size={14} /> Mark Paid
                          </button>
                        </>
                      ) : (
                        <button className="btn-secondary btn-sm" onClick={() => printSlip(p)}>
                          <Printer size={14} /> Slip
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="td text-center text-slate-500 py-8">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Process Payroll Modal */}
      {selectedTeacher && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Process Salary - {selectedTeacher.teacher.name}
              </h3>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Base Salary</label>
                  <input type="number" name="baseSalary" className="input" value={form.baseSalary} onChange={handleFormChange} required />
                </div>
                <div>
                  <label className="label">Allowances</label>
                  <input type="number" name="allowances" className="input" value={form.allowances} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="label">Leaves / Deductions</label>
                  <input type="number" name="deductions" className="input" value={form.deductions} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="label">Advance Deduction</label>
                  <input type="number" name="advanceDeduction" className="input" value={form.advanceDeduction} onChange={handleFormChange} />
                </div>
              </div>
              
              <div>
                <label className="label">Net Salary</label>
                <div className="input bg-slate-50 dark:bg-slate-900 font-bold text-lg">
                  Rs {(Number(form.baseSalary) + Number(form.allowances) - Number(form.deductions) - Number(form.advanceDeduction)).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="label">Status</label>
                <select name="status" className="input" value={form.status} onChange={handleFormChange}>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="label">Remarks (Optional)</label>
                <input type="text" name="remarks" className="input" value={form.remarks} onChange={handleFormChange} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Payroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
