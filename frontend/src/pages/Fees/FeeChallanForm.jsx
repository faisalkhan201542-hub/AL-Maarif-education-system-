import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { CHALLAN_TYPES } from "../../utils/constants.js";

const emptyForm = {
  student: "", challanType: "Monthly Fee", billingMonth: "", dueDate: "",
  feeAmount: "", admissionFee: 0, examinationFee: 0, otherCharges: 0,
  discount: 0, fine: 0, previousBalance: 0,
};

function defaultMonthLabel() {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function FeeChallanForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...emptyForm, billingMonth: defaultMonthLabel() });
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Payment recording (edit mode only)
  const [paidAmount, setPaidAmount] = useState("");
  const [txnRef, setTxnRef] = useState("");

  const { settings } = useSettings();

  useEffect(() => {
    const preselect = searchParams.get("student");
    if (preselect && settings) {
      api.get(`/api/students/${preselect}`).then((res) => {
        setSelectedStudent(res.data);
        setForm((f) => ({ 
          ...f, 
          student: res.data._id,
          feeAmount: settings?.feeStructure?.[res.data.class] || f.feeAmount
        }));
      });
    }
  }, [searchParams, settings]);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/fees/${id}`).then((res) => {
        const c = res.data;
        setSelectedStudent(c.student);
        setForm({
          student: c.student._id,
          challanType: c.challanType,
          billingMonth: c.billingMonth,
          dueDate: c.dueDate?.substring(0, 10),
          feeAmount: c.feeAmount,
          admissionFee: c.admissionFee,
          examinationFee: c.examinationFee,
          otherCharges: c.otherCharges,
          discount: c.discount,
          fine: c.fine,
          previousBalance: c.previousBalance,
        });
        setPaidAmount(c.paidAmount || "");
        setTxnRef(c.transactionReference || "");
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (studentSearch.length >= 2 && !isEdit) {
      api.get("/api/students", { params: { search: studentSearch, limit: 8 } }).then((res) => setStudents(res.data.students));
    } else {
      setStudents([]);
    }
  }, [studentSearch, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectStudent = (s) => {
    setSelectedStudent(s);
    setForm({ 
      ...form, 
      student: s._id,
      feeAmount: settings?.feeStructure?.[s.class] || ""
    });
    setStudents([]);
    setStudentSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student) return toast.error("Please select a student");
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/fees/${id}`, form);
        toast.success("Challan updated");
      } else {
        const res = await api.post("/api/fees", form);
        toast.success(`Challan generated: ${res.data.challanNumber}`);
        navigate(`/fees/${res.data._id}/print`);
        return;
      }
      navigate("/fees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save challan");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async () => {
    try {
      await api.put(`/api/fees/${id}/record-payment`, { paidAmount, transactionReference: txnRef, paymentDate: new Date() });
      toast.success("Payment recorded — pending Principal verification");
      navigate("/fees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Fee Challan" : "Generate Fee Challan"}</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Student *</label>
          {selectedStudent ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg px-3 py-2">
              <div className="text-sm">
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-xs text-gray-500">{selectedStudent.registrationNumber} • Class {selectedStudent.class}</p>
              </div>
              {!isEdit && <button type="button" className="text-xs text-primary-700" onClick={() => { setSelectedStudent(null); setForm({ ...form, student: "" }); }}>Change</button>}
            </div>
          ) : (
            <div className="relative">
              <input className="input" placeholder="Search student by name or registration no..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
              {students.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-56 overflow-y-auto">
                  {students.map((s) => (
                    <button type="button" key={s._id} onClick={() => handleSelectStudent(s)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b last:border-0">
                      {s.name} — {s.registrationNumber} (Class {s.class})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Challan Type</label>
            <select name="challanType" className="input" value={form.challanType} onChange={handleChange}>
              {CHALLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Billing Month *</label><input name="billingMonth" required className="input" value={form.billingMonth} onChange={handleChange} /></div>
          <div><label className="label">Due Date *</label><input type="date" name="dueDate" required className="input" value={form.dueDate} onChange={handleChange} /></div>
          <div><label className="label">Fee Amount (Rs.) *</label><input type="number" name="feeAmount" required className="input" value={form.feeAmount} onChange={handleChange} /></div>
          <div><label className="label">Admission Fee</label><input type="number" name="admissionFee" className="input" value={form.admissionFee} onChange={handleChange} /></div>
          <div><label className="label">Examination Fee</label><input type="number" name="examinationFee" className="input" value={form.examinationFee} onChange={handleChange} /></div>
          <div><label className="label">Other Charges</label><input type="number" name="otherCharges" className="input" value={form.otherCharges} onChange={handleChange} /></div>
          <div><label className="label">Discount</label><input type="number" name="discount" className="input" value={form.discount} onChange={handleChange} /></div>
          <div><label className="label">Fine</label><input type="number" name="fine" className="input" value={form.fine} onChange={handleChange} /></div>
          <div><label className="label">Previous Balance</label><input type="number" name="previousBalance" className="input" value={form.previousBalance} onChange={handleChange} /></div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : isEdit ? "Update Challan" : "Generate Challan"}</button>
        </div>
      </form>

      {isEdit && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700">Record EasyPaisa Payment</h2>
          <p className="text-xs text-gray-400">Enter the amount and transaction reference the father shared after paying via EasyPaisa. This will be marked "Pending" until you verify it.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Paid Amount (Rs.)</label><input type="number" className="input" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} /></div>
            <div><label className="label">EasyPaisa Transaction ID / Reference No.</label><input className="input" value={txnRef} onChange={(e) => setTxnRef(e.target.value)} /></div>
          </div>
          <button className="btn-gold" onClick={handleRecordPayment}>Save Payment</button>
        </div>
      )}
    </div>
  );
}
