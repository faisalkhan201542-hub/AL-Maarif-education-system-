import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Logo from "../../components/Logo.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

export default function StudentIDCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    api.get(`/api/students/${id}`).then((res) => setStudent(res.data));
  }, [id]);

  if (!student) return <Loader />;
  const photo = student.photoUrl?.startsWith("http") ? student.photoUrl : `${API_URL}${student.photoUrl}`;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between no-print">
        <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
        <button className="btn-primary" onClick={() => window.print()}><Printer size={14}/> Print Student Card</button>
      </div>

      <div className="flex flex-wrap gap-6 justify-center print-area">
        {/* FRONT */}
        <div className="w-80 rounded-2xl overflow-hidden shadow-lg border-2 border-primary-700">
          <div className="bg-gradient-to-br from-primary-800 to-primary-950 text-white p-4 flex flex-col items-center">
            <Logo size={34} showName={false} />
            <p className="font-bold mt-1 text-center">{settings?.schoolName || "Al-Maarif Education"}</p>
            <p className="text-xs text-primary-200">Student ID Card</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 flex flex-col items-center">
            <img src={photo} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-gold-400 -mt-14 bg-white dark:bg-slate-800" />
            <h2 className="font-bold text-lg mt-2 text-center">{student.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono">{student.registrationNumber}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-3 w-full">
              <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Class</p><p className="text-right font-medium">{student.class}</p>
              <p className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Roll No</p><p className="text-right font-medium">{student.rollNumber}</p>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="w-80 rounded-2xl overflow-hidden shadow-lg border-2 border-primary-700 flex flex-col">
          <div className="bg-primary-900 text-white p-4 text-center font-bold">Student Information</div>
          <div className="bg-white dark:bg-slate-800 p-5 flex-1 text-sm space-y-2">
            <p><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Father Name: </span>{student.fatherName}</p>
            <p><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Father WhatsApp: </span>{student.fatherWhatsapp}</p>
            <p><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">School Address: </span>{settings?.address}</p>
            <p><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Principal: </span>{settings?.principalName}</p>
            <p><span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">Contact: </span>{settings?.principalWhatsapp}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 py-2">If found, please return to Al-Maarif Education.</div>
        </div>
      </div>
    </div>
  );
}
