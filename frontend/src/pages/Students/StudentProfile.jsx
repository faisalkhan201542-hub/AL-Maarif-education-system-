import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Printer, CreditCard, Wallet, CalendarCheck, Award } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import { fmtDate, fmtMoney, statusBadgeClass } from "../../utils/format.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => api.get(`/api/students/${id}/profile`).then((res) => setBundle(res.data));

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/students/${id}`);
      toast.success("Student deleted");
      navigate("/students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  if (!bundle) return <Loader />;
  const { student, attendance, fees, results } = bundle;
  const photo = student.photoUrl?.startsWith("http") ? student.photoUrl : `${API_URL}${student.photoUrl}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="card print-area">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img src={photo} alt={student.name} className="w-24 h-24 rounded-xl object-cover bg-gray-100 border" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-sm text-gray-500">Registration No: <span className="font-mono">{student.registrationNumber}</span></p>
            <p className="text-sm text-gray-500">Class {student.class} • Roll No {student.rollNumber}</p>
            <span className={statusBadgeClass(student.status)}>{student.status}</span>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
            <Link to={`/students/${id}/edit`} className="btn-secondary btn-sm"><Pencil size={14}/> Edit</Link>
            <button className="btn-danger btn-sm" onClick={() => setConfirmDelete(true)}><Trash2 size={14}/> Delete</button>
            <button className="btn-secondary btn-sm" onClick={() => window.print()}><Printer size={14}/> Print</button>
            <Link to={`/students/${id}/id-card`} className="btn-gold btn-sm"><CreditCard size={14}/> Student Card</Link>
            <WhatsAppButton phone={student.fatherWhatsapp} message={`Assalam-o-Alaikum, this is regarding your child ${student.name} at Al-Maarif Education.`} label="WhatsApp Father" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
          <div><p className="text-gray-400">Father Name</p><p className="font-medium">{student.fatherName}</p></div>
          <div><p className="text-gray-400">Father WhatsApp</p><p className="font-medium">{student.fatherWhatsapp}</p></div>
          <div><p className="text-gray-400">Gender</p><p className="font-medium">{student.gender}</p></div>
          <div><p className="text-gray-400">Date of Birth</p><p className="font-medium">{fmtDate(student.dob)}</p></div>
          <div><p className="text-gray-400">Admission Date</p><p className="font-medium">{fmtDate(student.admissionDate)}</p></div>
          <div><p className="text-gray-400">Address</p><p className="font-medium">{student.address || "-"}</p></div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-primary-700 font-semibold mb-2"><CalendarCheck size={18}/> Attendance</div>
          <p className="text-2xl font-bold">{attendance.attendancePercentage}%</p>
          <p className="text-xs text-gray-400">{attendance.present} present / {attendance.absent} absent / {attendance.leave} leave (last {attendance.records.length} days)</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-gold-600 font-semibold mb-2"><Wallet size={18}/> Fees</div>
          <p className="text-2xl font-bold">{fmtMoney(fees.pendingFees)}</p>
          <p className="text-xs text-gray-400">Pending across {fees.challans.length} challan(s)</p>
          <Link to={`/fees/new?student=${id}`} className="text-xs text-primary-700 hover:underline mt-1 inline-block no-print">Generate Fee Challan →</Link>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2"><Award size={18}/> Results</div>
          <p className="text-2xl font-bold">{results.length}</p>
          <p className="text-xs text-gray-400">Exam result(s) recorded</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-700 mb-3">Fee Challans</h2>
        {fees.challans.length === 0 ? (
          <p className="text-sm text-gray-400">No fee challans generated yet.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th className="th">Challan No</th><th className="th">Month</th><th className="th">Total</th><th className="th">Paid</th><th className="th">Status</th><th className="th">Verification</th><th className="th">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {fees.challans.map((c) => (
                <tr key={c._id}>
                  <td className="td font-mono text-xs">{c.challanNumber}</td>
                  <td className="td">{c.billingMonth}</td>
                  <td className="td">{fmtMoney(c.totalAmount)}</td>
                  <td className="td">{fmtMoney(c.paidAmount)}</td>
                  <td className="td"><span className={statusBadgeClass(c.paymentStatus)}>{c.paymentStatus}</span></td>
                  <td className="td"><span className={statusBadgeClass(c.verificationStatus)}>{c.verificationStatus}</span></td>
                  <td className="td"><Link to={`/fees/${c._id}/print`} className="btn-secondary btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-700 mb-3">Results</h2>
        {results.length === 0 ? (
          <p className="text-sm text-gray-400">No results recorded yet.</p>
        ) : (
          <table className="table-base">
            <thead><tr><th className="th">Exam</th><th className="th">Percentage</th><th className="th">Grade</th><th className="th">Status</th><th className="th">Position</th><th className="th">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r) => (
                <tr key={r._id}>
                  <td className="td">{r.exam?.title}</td>
                  <td className="td">{r.percentage}%</td>
                  <td className="td">{r.grade}</td>
                  <td className="td"><span className={statusBadgeClass(r.status)}>{r.status}</span></td>
                  <td className="td">{r.position || "-"}</td>
                  <td className="td"><Link to={`/results/${r._id}`} className="btn-secondary btn-sm">Result Card</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this student?"
        message="This will permanently delete all linked attendance, fee and result records."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
