import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

  const ChallanCopy = ({ copyType }) => (
    <div className="flex-1 p-4 border-2 border-primary-700 bg-white dark:bg-slate-800 relative">
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
        <Logo size={300} showName={false} />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-3 mb-3">
          <div className="flex gap-3 items-center">
            <Logo size={40} showName={false} />
            <div>
              <h1 className="text-lg font-bold text-primary-800 leading-tight">{settings?.schoolName}</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500">{settings?.address}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">{copyType}</h2>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 dark:text-slate-500">Challan No: <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{challan.challanNumber}</span></p>
          </div>
        </div>

        <div className="flex justify-between text-[11px] mb-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border">
          <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Month: </span><span className="font-bold">{challan.billingMonth}</span></p>
          <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Issue: </span>{fmtDate(challan.issueDate)}</p>
          <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Due: </span><span className="font-bold text-red-600">{fmtDate(challan.dueDate)}</span></p>
        </div>

        {/* Student info */}
        <div className="flex gap-3 items-center mb-3 text-[11px]">
          <img src={photo} alt={s.name} className="w-12 h-12 rounded border object-cover bg-slate-100 dark:bg-slate-800" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1">
            <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Name: </span><strong className="text-xs">{s.name}</strong></p>
            <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Reg No: </span><span className="font-mono">{s.registrationNumber}</span></p>
            <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Father: </span>{s.fatherName}</p>
            <p><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Class: </span>{challan.class} &nbsp; <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Roll: </span>{s.rollNumber}</p>
          </div>
        </div>

        {/* Fee table */}
        <table className="w-full text-[11px] mb-3 border">
          <thead><tr className="bg-slate-100 dark:bg-slate-800"><th className="text-left px-2 py-1 border-b">Description</th><th className="text-right px-2 py-1 border-b">Amount</th></tr></thead>
          <tbody>
            {rows.map(([label, amount]) => (
              <tr key={label}><td className="px-2 py-1 border-b text-slate-600 dark:text-slate-400 dark:text-slate-500">{label}</td><td className="px-2 py-1 border-b text-right font-mono">{fmtMoney(amount)}</td></tr>
            ))}
            <tr className="font-bold bg-slate-50"><td className="px-2 py-1.5">Total Payable</td><td className="px-2 py-1.5 text-right text-sm">{fmtMoney(challan.totalAmount)}</td></tr>
            <tr className="font-bold text-emerald-700 bg-emerald-50"><td className="px-2 py-1.5">Received Amount</td><td className="px-2 py-1.5 text-right text-sm">{fmtMoney(challan.paidAmount || 0)}</td></tr>
            <tr className="font-bold text-red-700 bg-red-50"><td className="px-2 py-1.5">Arrears / Remaining</td><td className="px-2 py-1.5 text-right text-sm">{fmtMoney(challan.remainingAmount)}</td></tr>
          </tbody>
        </table>

        {/* EasyPaisa section & QR Code */}
        <div className="flex gap-3 items-center">
          <div className="border border-dashed border-gold-400 rounded p-2 bg-gold-50 flex-1">
            <h3 className="font-bold text-gold-700 text-[10px] mb-1">EASYPAISA PAYMENT</h3>
            <p className="text-[10px]"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">A/c No: </span><span className="font-mono font-bold text-xs">{settings?.easypaisaNumber}</span></p>
            <p className="text-[10px] mt-0.5"><span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">A/c Title: </span>{settings?.easypaisaAccountName}</p>
            <div className="mt-2 text-[10px]">
              <p>Txn Ref: {challan.transactionReference || "_______________"}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-1 border rounded bg-white dark:bg-slate-800">
            <QRCodeSVG 
              value={`CHALLAN:${challan.challanNumber}|AMT:${challan.totalAmount}|STU:${s.registrationNumber}`} 
              size={64}
              level={"H"}
            />
            <span className="text-[8px] mt-1 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Scan to Verify</span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="text-[9px] text-slate-500 dark:text-slate-400 dark:text-slate-500 space-y-0.5">
            <p>1. Please pay before due date.</p>
            <p>2. Keep receipt for records.</p>
          </div>
          <div className="text-center text-[10px]">
            <div className="h-6 border-b border-gray-400 w-24 mb-1" />
            <p className="font-semibold">{settings?.principalName}</p>
            <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Principal</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 no-print">
        <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
        <div className="flex gap-2">
          <button className="btn-whatsapp" onClick={handleWhatsapp}><MessageCircle size={14}/> WhatsApp Challan</button>
          <button className="btn-primary" onClick={() => window.print()}><Printer size={14}/> Print / Save PDF</button>
        </div>
      </div>

      <div className="print-area flex flex-col md:flex-row gap-6">
        <ChallanCopy copyType="STUDENT COPY" />
        {/* Divider for cutting */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <div className="h-full border-l-2 border-dashed border-gray-300"></div>
          <div className="absolute bg-white dark:bg-slate-800 px-1 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs rotate-90">✂ Cut Here</div>
        </div>
        <ChallanCopy copyType="SCHOOL COPY" />
      </div>
    </div>
  );
}
