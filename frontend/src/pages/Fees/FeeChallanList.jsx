import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search, CheckCircle2, XCircle, Printer } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import ExportButtons from "../../components/ExportButtons.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatCard from "../../components/StatCard.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import WhatsAppDispatchQueue from "../../components/WhatsAppDispatchQueue.jsx";
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

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    class: "",
    billingMonth: "",
    dueDate: "",
    feeAmount: "",
  });

  const [queueOpen, setQueueOpen] = useState(false);
  const [dispatchItems, setDispatchItems] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

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

  const openPaymentModal = (challan) => {
    setPaymentData({
      challan,
      amount: challan.remainingAmount,
      method: "Cash"
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!paymentData || paymentData.amount <= 0) return toast.error("Invalid amount");
    
    try {
      await api.put(`/api/fees/${paymentData.challan._id}/receive-payment`, {
        amount: paymentData.amount,
        paymentMethod: paymentData.method
      });
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setPaymentData(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/fees/bulk", bulkData);
      toast.success(res.data.message);
      setShowBulkModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate bulk challans");
    }
  };

  const handleBulkReminders = () => {
    // Filter unpaid or partial
    const pending = challans.filter(c => c.paymentStatus !== "Paid" && c.student && c.student.fatherWhatsapp);
    if (pending.length === 0) {
      toast.error("No unpaid challans found in the current view with valid phone numbers.");
      return;
    }

    const items = pending.map(c => ({
      name: c.student.name,
      phone: c.student.fatherWhatsapp,
      message: `📄 *Al-Maarif Education (Fee Challan - ${c.billingMonth})*\n\nAssalam-o-Alaikum!\nMohtaram Walidain, aap ke bache *${c.student.name}* ki fees due hai.\n\n*Tafseelat:*\n- Mahina: ${c.billingMonth}\n- Baqaya Jaat (Arrears): Rs. ${c.previousBalance}\n- Mahana Fees: Rs. ${c.feeAmount}\n- Total Fees: *Rs. ${c.totalAmount}*\n- Aakhri Tareeq (Due Date): ${new Date(c.dueDate).toDateString()}\n\n*Adaigi Ka Tareeqa (EasyPaisa):*\nAccount Name: Murad Ali Khalil\n\nBaraye meharbani aakhri tareeq se pehle fees jama karwayein taa k jurmane se bacha ja sake. Fees adaa karne ke baad EasyPaisa ki rasid (screenshot) isi number par lazmi bhej dein taa k aap ki fees system mein clear ki ja sake. Shukriya!`
    }));

    setDispatchItems(items);
    setQueueOpen(true);
  };

  const exportColumns = [
    { header: "Challan No", key: "challanNo" },
    { header: "Student", key: "studentName", render: (c) => c.student?.name || "-" },
    { header: "Class", key: "studentClass", render: (c) => c.student?.class || "-" },
    { header: "Month", key: "billingMonth" },
    { header: "Total Amount (Rs)", key: "totalAmount" },
    { header: "Status", key: "status" },
    { header: "Due Date", key: "dueDate", render: (c) => new Date(c.dueDate).toLocaleDateString() }
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Fee Challans (EasyPaisa)"
        subtitle="Manage and track student fee collections"
        className="from-sky-500 via-blue-500 to-indigo-500"
        rightElement={
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <ExportButtons 
              data={challans} 
              columns={exportColumns} 
              title="Fee Challans Report" 
              filename="Fee_Challans" 
            />
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg shadow-sm font-bold flex items-center justify-center transition-colors w-full sm:w-auto" onClick={handleBulkReminders}>Send Reminders</button>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg shadow-sm font-bold flex items-center justify-center transition-colors w-full sm:w-auto" onClick={() => setShowBulkModal(true)}>Bulk Generate</button>
            <button className="px-4 py-2 bg-white text-sky-600 hover:bg-sky-50 rounded-lg shadow-sm font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto" onClick={() => navigate("/fees/new")}><Plus size={16}/> Single</button>
          </div>
        }
      />

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
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500" />
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
                <th className="th">Month</th><th className="th text-right">Total</th><th className="th text-right">Received</th><th className="th text-right">Arrears</th><th className="th text-center">Status</th>
                <th className="th text-center">Verification</th><th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {challans.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/50">
                  <td className="td font-mono text-xs">{c.challanNumber}</td>
                  <td className="td font-medium">{c.student?.name}</td>
                  <td className="td">{c.class}</td>
                  <td className="td">{c.billingMonth}</td>
                  <td className="td text-right font-medium">{fmtMoney(c.totalAmount)}</td>
                  <td className="td text-right font-medium text-emerald-600 dark:text-emerald-400">{fmtMoney(c.paidAmount || 0)}</td>
                  <td className="td text-right font-medium text-red-600 dark:text-red-400">{fmtMoney(c.remainingAmount)}</td>
                  <td className="td text-center"><span className={statusBadgeClass(c.paymentStatus)}>{c.paymentStatus}</span></td>
                  <td className="td text-center"><span className={statusBadgeClass(c.verificationStatus)}>{c.verificationStatus}</span></td>
                  <td className="td text-right">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {c.paymentStatus !== "Paid" && (
                        <button className="btn-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2 flex items-center gap-1 font-medium shadow-sm" title="Receive Payment" onClick={() => openPaymentModal(c)}>
                          <CheckCircle2 size={14}/> Receive Payment
                        </button>
                      )}
                      <Link to={`/fees/${c._id}/print`} className="btn-secondary btn-sm" title="Print"><Printer size={14}/></Link>
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

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md animate-scale-up overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bulk Generate Class Fees</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleBulkGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class *</label>
                <select required className="input" value={bulkData.class} onChange={e => setBulkData({...bulkData, class: e.target.value})}>
                  <option value="">Select Class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Month *</label>
                  <input required type="text" className="input" placeholder="e.g. October 2026" value={bulkData.billingMonth} onChange={e => setBulkData({...bulkData, billingMonth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
                  <input required type="date" className="input" value={bulkData.dueDate} onChange={e => setBulkData({...bulkData, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monthly Fee Amount (Rs) *</label>
                <input required type="number" min="0" className="input" value={bulkData.feeAmount} onChange={e => setBulkData({...bulkData, feeAmount: e.target.value})} />
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowBulkModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Generate For Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md animate-scale-up overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Receive Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={submitPayment} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <p className="font-semibold text-blue-900 dark:text-blue-100">{paymentData.challan.student?.name}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Challan: {paymentData.challan.challanNumber} &bull; Class: {paymentData.challan.class}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Rs. {paymentData.challan.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remaining Amount</p>
                  <p className="font-bold text-red-600 dark:text-red-400">Rs. {paymentData.challan.remainingAmount}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receiving Amount (Rs.) *</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  max={paymentData.challan.remainingAmount}
                  className="input text-lg font-semibold" 
                  value={paymentData.amount} 
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select className="input" value={paymentData.method} onChange={e => setPaymentData({...paymentData, method: e.target.value})}>
                  <option>Cash</option>
                  <option>EasyPaisa</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WhatsAppDispatchQueue 
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        items={dispatchItems}
        title="Fee Reminders Queue"
      />
    </div>
  );
}
