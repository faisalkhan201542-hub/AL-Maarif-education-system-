import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft, Award, Calendar, Hash as HashIcon, MapPin, Phone } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Logo from "../../components/Logo.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResultCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/api/results/${id}`).then((res) => setResult(res.data));
  }, [id]);

  if (!result) return <Loader />;
  const s = result.student;
  const photo = s.photoUrl?.startsWith("http") ? s.photoUrl : `${API_URL}${s.photoUrl}`;

  // Helper for grade colors
  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isPass = result.status === 'Pass';

  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans pb-10">
      <div className="flex justify-between no-print mb-6">
        <button className="btn-secondary bg-white shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1"/> Back to Results
        </button>
        <button className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all" onClick={() => window.print()}>
          <Printer size={16}/> Print Result Card
        </button>
      </div>

      <div 
        className="card print-area p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border-0 print:shadow-none print:rounded-none"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
      >
        {/* Colorful Gradient Header */}
        <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-blue-800 text-white p-8 pb-12 relative print:bg-primary-800 overflow-hidden">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12">
            <Award size={240} />
          </div>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="bg-white p-3 rounded-2xl shadow-xl mb-4 inline-block">
               <Logo size={64} showName={false} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 uppercase">{settings?.schoolName || "Al-Maarif Education"}</h1>
            <div className="flex items-center gap-4 text-primary-100 text-sm font-medium">
              <span className="flex items-center gap-1"><MapPin size={14}/> {settings?.address || "Main City Road, District"}</span>
              <span className="flex items-center gap-1"><Phone size={14}/> {settings?.phone || "+92 300 0000000"}</span>
            </div>
            
            <div className="mt-8 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2 rounded-full">
              <h2 className="text-xl font-bold tracking-widest uppercase text-white">Student Result Card</h2>
            </div>
          </div>
        </div>

        <div className="px-8 -mt-6 relative z-20 mb-8">
          {/* Student Info Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative">
              <img src={photo} alt={s.name} className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md bg-slate-100" />
              <div className="absolute -bottom-3 -right-3 bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                {s.class}
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 w-full">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Student Name</p>
                <p className="text-lg font-bold text-slate-800">{s.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Father's Name</p>
                <p className="text-lg font-bold text-slate-800">{s.fatherName}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <HashIcon className="text-slate-300" size={16}/>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Registration No</p>
                  <p className="font-mono font-medium text-slate-700">{s.registrationNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <HashIcon className="text-slate-300" size={16}/>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Roll No</p>
                  <p className="font-medium text-slate-700">{s.rollNumber}</p>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Calendar className="text-primary-500" size={18}/>
                <p className="text-sm font-medium text-slate-700"><span className="text-slate-500">Examination:</span> {result.exam.title}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-10">
          {/* Grades Table */}
          <div className="rounded-xl overflow-hidden border border-slate-200 mb-8 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-bold border-b border-slate-200">Subject</th>
                  <th className="text-center px-6 py-4 font-bold border-b border-slate-200">Total Marks</th>
                  <th className="text-center px-6 py-4 font-bold border-b border-slate-200">Obtained Marks</th>
                  <th className="text-right px-6 py-4 font-bold border-b border-slate-200">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.subjects.map((sub, idx) => (
                  <tr key={sub.subject} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-6 py-4 font-semibold text-slate-800">{sub.subject}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-500">{sub.totalMarks}</td>
                    <td className="px-6 py-4 text-center font-bold text-primary-700 text-base">{sub.obtainedMarks}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(sub.grade)}`}>
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Prominent Stats Block */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total</p>
              <p className="text-3xl font-extrabold text-slate-700">{result.totalMarks}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Obtained</p>
              <p className="text-3xl font-extrabold text-primary-600">{result.obtainedMarks}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-5 border border-primary-100 flex flex-col items-center justify-center text-center shadow-sm">
              <p className="text-primary-500 text-xs font-bold uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-3xl font-extrabold text-primary-700">{result.percentage}%</p>
            </div>
            <div className={`${isPass ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} rounded-xl p-5 border flex flex-col items-center justify-center text-center shadow-sm`}>
              <p className={`${isPass ? 'text-emerald-500' : 'text-red-500'} text-xs font-bold uppercase tracking-widest mb-1`}>Status</p>
              <p className={`text-2xl font-extrabold uppercase ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>{result.status}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm font-bold uppercase">Class Position:</span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-1.5 rounded-lg font-bold text-lg">
                  {result.position ? `${result.position}${
                    result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'
                  }` : "-"}
                </span>
              </div>
              {result.remarks && (
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Principal Remarks</p>
                  <p className="text-sm font-medium italic text-slate-700">"{result.remarks}"</p>
                </div>
              )}
            </div>

            <div className="text-center shrink-0 w-48 mt-8 md:mt-0 pt-8 border-t-2 border-slate-300 border-dashed">
              <p className="font-bold text-slate-800">{settings?.principalName || "Principal Signature"}</p>
              <p className="text-slate-400 text-xs font-medium uppercase mt-1">Principal</p>
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-400 text-xs font-medium no-print">
            This is a computer-generated document.
          </div>
        </div>
      </div>
    </div>
  );
}
