import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search, CheckCircle2, XCircle, Printer } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatCard from "../../components/StatCard.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import { fmtMoney, statusBadgeClass } from "../../utils/format.js";
import { CLASSES } from "../../utils/constants.js";
import { Wallet, CheckCircle, XCircle as XCircleIcon, Clock, Coins, AlertTriangle } from "lucide-react";

export default function FeeChallanList() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/fees", { params: { search, class: className, status, limit: 50 } });
    setChallans(res.data.challans);
    setStats(res.data.stats);
    setLoading(false);
  };

  useEffect(() => { load(); }, [className, status]); // eslint-disable-line

  const handleWhatsapp = async (challan) => {
    const res = await api.get(`/api/fees/${challan._id}/whatsapp-link`);
    window.open(res.data.link, "_blank", "noopener,noreferrer");
  };

  const handleVerify = async (challan, verificationStatus) => {
    try {
      await api.put(`/api/fees/${challan._id}/verify`, { verificationStatus });
      toast.success(`Payment marked ${verificationStatus}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Fee Challans (EasyPaisa)</h1>
        <button className="btn-primary" onClick={() => navigate("/fees/new")}><Plus size={16}/> Generate Fee Challan</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Challans" value={stats.totalChallans} icon={Wallet} />
          <StatCard label="Paid" value={stats.paidChallans} icon={CheckCircle} tone="primary" />
          <StatCard label="Unpaid" value={stats.unpaidChallans} icon={XCircleIcon} tone="red" />
          <StatCard label="Pending Verification" value={stats.pendingVerification} icon={Clock} tone="gold" />
          <StatCard label="Total Collection" value={fmtMoney(stats.totalCollection)} icon={Coins} tone="primary" />
          <StatCard label="Total Outstanding" value={fmtMoney(stats.totalOutstanding)} icon={AlertTriangle} tone="red" />
        </div>
      )}

      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search by student, registration no or challan no..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={className} onChange={(e) => setClassName(e.target.value)}>
          <option value="">All Classes</option>
          {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option>Unpaid</option><option>Partial</option><option>Paid</option>
        </select>
        <button className="btn-secondary" onClick={load}>Search</button>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? <Loader /> : challans.length === 0 ? <EmptyState title="No fee challans found" /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Challan No</th><th className="th">Student</th><th className="th">Class</th>
                <th className="th">Month</th><th className="th">Amount</th><th className="th">Status</th>
                <th className="th">Verification</th><th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {challans.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="td font-mono text-xs">{c.challanNumber}</td>
                  <td className="td font-medium">{c.student?.name}</td>
                  <td className="td">{c.class}</td>
                  <td className="td">{c.billingMonth}</td>
                  <td className="td">{fmtMoney(c.totalAmount)}</td>
                  <td className="td"><span className={statusBadgeClass(c.paymentStatus)}>{c.paymentStatus}</span></td>
                  <td className="td"><span className={statusBadgeClass(c.verificationStatus)}>{c.verificationStatus}</span></td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1.5">
                      <Link to={`/fees/${c._id}/print`} className="btn-secondary btn-sm"><Printer size={14}/></Link>
                      <Link to={`/fees/${c._id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                      <button className="btn-whatsapp btn-sm" title="WhatsApp Challan" onClick={() => handleWhatsapp(c)}>WhatsApp</button>
                      {c.paidAmount > 0 && c.verificationStatus === "Pending" && (
                        <>
                          <button className="btn-sm bg-green-600 text-white rounded-lg px-2" title="Verify" onClick={() => handleVerify(c, "Verified")}><CheckCircle2 size={14}/></button>
                          <button className="btn-sm bg-red-500 text-white rounded-lg px-2" title="Reject" onClick={() => handleVerify(c, "Rejected")}><XCircle size={14}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
