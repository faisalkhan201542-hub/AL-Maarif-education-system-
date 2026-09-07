import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, MessageCircle } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Logo from "../../components/Logo.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { fmtDate, fmtMoney, statusBadgeClass } from "../../utils/format.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FeeChallanPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [challan, setChallan] = useState(null);

  const load = () => api.get(`/api/fees/${id}`).then((res) => setChallan(res.data));
  useEffect(() => { load(); }, [id]);

  const handleWhatsapp = async () => {
    const res = await api.get(`/api/fees/${id}/whatsapp-link`);
    window.open(res.data.link, "_blank", "noopener,noreferrer");
  };

  if (!challan) return <Loader />;
  const s = challan.student;
  const photo = s.photoUrl?.startsWith("http") ? s.photoUrl : `${API_URL}${s.photoUrl}`;

  const rows = [
    ["Monthly Fee", challan.feeAmount],
    ["Admission Fee", challan.admissionFee],
    ["Examination Fee", challan.examinationFee],
    ["Other Charges", challan.otherCharges],
    ["Previous Balance", challan.previousBalance],
    ["Fine", challan.fine],
    ["Discount", -challan.discount],
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
        <div className="flex gap-2">
          <button className="btn-whatsapp" onClick={handleWhatsapp}><MessageCircle size={14}/> WhatsApp Challan</button>
          <button className="btn-primary" onClick={() => window.print()}><Printer size={14}/> Print / Save PDF</button>
        </div>
      </div>

      <div className="card print-area border-2 border-primary-700">
        {/* Header */}
        <div className="flex flex-col items-center text-center border-b pb-4 mb-4">
          <Logo size={48} showName={false} />
          <h1 className="text-xl font-bold text-primary-800 mt-2">{settings?.schoolName}</h1>
          <p className="text-sm text-gray-500">{settings?.address}</p>
          <h2 className="mt-3 font-bold text-lg tracking-wide">FEE CHALLAN</h2>
        </div>

        <div className="flex flex-wrap justify-between text-sm mb-4 gap-2">
          <p><span className="text-gray-400">Challan No: </span><span className="font-mono font-medium">{challan.challanNumber}</span></p>
          <p><span className="text-gray-400">Issue Date: </span>{fmtDate(challan.issueDate)}</p>
          <p><span className="text-gray-400">Due Date: </span>{fmtDate(challan.dueDate)}</p>
        </div>

        {/* Student info */}
        <div className="border rounded-lg p-4 mb-4 flex gap-4 items-center">
          <img src={photo} alt={s.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm flex-1">
            <p><span className="text-gray-400">Student Name: </span>{s.name}</p>
            <p><span className="text-gray-400">Registration No: </span><span className="font-mono">{s.registrationNumber}</span></p>
            <p><span className="text-gray-400">Father Name: </span>{s.fatherName}</p>
            <p><span className="text-gray-400">Class: </span>{challan.class} &nbsp; <span className="text-gray-400">Roll No: </span>{s.rollNumber}</p>
          </div>
        </div>

        {/* Fee table */}
        <table className="w-full text-sm mb-4 border">
          <thead><tr className="bg-gray-50"><th className="text-left px-3 py-2 border-b">Description</th><th className="text-right px-3 py-2 border-b">Amount</th></tr></thead>
          <tbody>
            {rows.map(([label, amount]) => (
              <tr key={label}><td className="px-3 py-1.5 border-b">{label}</td><td className="px-3 py-1.5 border-b text-right">{fmtMoney(amount)}</td></tr>
            ))}
            <tr className="font-bold bg-primary-50"><td className="px-3 py-2">Total Payable</td><td className="px-3 py-2 text-right">{fmtMoney(challan.totalAmount)}</td></tr>
            <tr><td className="px-3 py-1.5 border-b">Paid Amount</td><td className="px-3 py-1.5 border-b text-right">{fmtMoney(challan.paidAmount)}</td></tr>
            <tr className="font-semibold"><td className="px-3 py-1.5">Remaining Amount</td><td className="px-3 py-1.5 text-right">{fmtMoney(challan.remainingAmount)}</td></tr>
          </tbody>
        </table>

        <div className="flex gap-2 mb-4 text-sm">
          <span className={statusBadgeClass(challan.paymentStatus)}>{challan.paymentStatus}</span>
          <span className={statusBadgeClass(challan.verificationStatus)}>Verification: {challan.verificationStatus}</span>
        </div>

        {/* EasyPaisa section */}
        <div className="border-2 border-dashed border-gold-400 rounded-lg p-4 mb-4 bg-gold-50">
          <h3 className="font-bold text-gold-700 mb-2">EASYPAISA PAYMENT</h3>
          <p className="text-sm">Pay Your School Fee Through EasyPaisa</p>
          <p className="text-sm mt-1"><span className="text-gray-500">EasyPaisa Number: </span><span className="font-mono font-bold">{settings?.easypaisaNumber}</span></p>
          <p className="text-sm"><span className="text-gray-500">Account Name: </span>{settings?.easypaisaAccountName}</p>
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <p><span className="text-gray-500">Transaction Reference No: </span>{challan.transactionReference || "___________________"}</p>
            <p><span className="text-gray-500">Payment Date: </span>{challan.paymentDate ? fmtDate(challan.paymentDate) : "___________________"}</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1 mb-6">
          <p className="font-semibold text-gray-600">Important Instructions</p>
          <p>• Please pay before the due date.</p>
          <p>• Keep the EasyPaisa transaction receipt.</p>
          <p>• Provide the transaction/reference number to the school.</p>
          <p>• Fee payment will be marked verified after confirmation by the Principal.</p>
          <p>• This challan is generated by {settings?.schoolName}.</p>
        </div>

        <div className="flex justify-end">
          <div className="text-center text-sm">
            <div className="h-10 border-b border-gray-400 w-40 mb-1" />
            <p className="font-semibold">{settings?.principalName}</p>
            <p className="text-gray-400 text-xs">Principal Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
