import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Logo from "../../components/Logo.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { fmtDate } from "../../utils/format.js";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

export default function StudentIdCardBulk() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const className = searchParams.get("class") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    api.get("/api/students", {
      params: { class: className, search, limit: 2000, sortBy: "rollNumber", sortDir: "asc" }
    }).then(res => {
      setStudents(res.data.students);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [className, search]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 print:bg-white print:dark:bg-white p-4">
      {/* Non-Printable Header */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Bulk ID Cards {className ? `- ${className}` : ""}
            </h1>
            <p className="text-sm text-slate-500">{students.length} students found</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={18} /> Print Cards
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center p-12 text-slate-500">No students found matching the criteria.</div>
      ) : (
        /* 
          Grid layout for ID cards. 
          Standard CR80 ID Card dimensions: ~ 54mm x 86mm (Portrait).
          We use CSS flex/grid to place them side by side.
        */
        <div className="flex flex-wrap gap-6 justify-center items-start print:gap-4 print:justify-start mx-auto max-w-7xl print:max-w-none">
          {students.map(student => {
            const photo = student.photoUrl?.match(/^(http|data:)/) ? student.photoUrl : `${API_URL}${student.photoUrl}`;
            
            return (
              <div key={student._id} className="flex flex-col sm:flex-row gap-4 print:gap-1 break-inside-avoid" style={{pageBreakInside: 'avoid'}}>
                
                {/* ---------- FRONT CARD ---------- */}
                <div 
                  className="relative bg-white shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300 print:border flex flex-col"
                  style={{ 
                    width: '54mm', 
                    height: '86mm', 
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif'
                  }}
                >
                  {/* Header Shape */}
                  <div className="absolute top-0 left-0 right-0 h-[70px] bg-primary-800 rounded-b-[40%] scale-x-[1.2] transform origin-top border-b-[3px] border-gold-500 z-0" style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}></div>
                  
                  <div className="relative z-10 flex flex-col items-center pt-2 px-2 text-center h-full">
                    {/* Header Text */}
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <Logo size={24} showName={false} />
                      <h2 className="text-[10px] font-extrabold text-white leading-tight uppercase tracking-widest mt-0.5">
                        {settings?.schoolName || "Al-Maarif"}
                      </h2>
                    </div>

                    {/* Photo */}
                    <div className="mt-2 bg-white p-0.5 rounded-full shadow-sm z-10" style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                      {student.photoUrl ? (
                        <img 
                          src={photo} 
                          alt="student" 
                          className="w-[72px] h-[72px] rounded-full object-cover border-[3px] border-primary-100 bg-slate-50"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-full border-[3px] border-primary-100 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          No Photo
                        </div>
                      )}
                    </div>

                    {/* Name Block */}
                    <div className="mt-2 w-full text-center px-1">
                      <h3 className="text-[13px] font-bold text-slate-900 leading-tight truncate uppercase">
                        {student.name}
                      </h3>
                      <p className="text-[9px] font-bold text-primary-600 tracking-wider uppercase mt-0.5 border-b border-slate-200 inline-block pb-0.5">Student</p>
                    </div>

                    {/* Info Block */}
                    <div className="w-full mt-2 text-left text-[9px] space-y-[3px] leading-snug px-2 flex-1">
                      <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-0.5">
                        <span className="text-primary-700 font-bold uppercase text-[8px]">Class:</span>
                        <span className="font-bold text-slate-800">{student.class}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-0.5">
                        <span className="text-primary-700 font-bold uppercase text-[8px]">Roll No:</span>
                        <span className="font-bold text-slate-800">{student.rollNumber}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-0.5">
                        <span className="text-primary-700 font-bold uppercase text-[8px]">Reg No:</span>
                        <span className="font-bold text-slate-800">{student.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-0.5">
                        <span className="text-primary-700 font-bold uppercase text-[8px]">DOB:</span>
                        <span className="font-bold text-slate-800">{fmtDate(student.dob)}</span>
                      </div>
                    </div>
                    
                    {/* Footer Strip */}
                    <div className="w-full h-2 bg-primary-800 absolute bottom-0 left-0 right-0" style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}></div>
                  </div>
                </div>

                {/* ---------- BACK CARD ---------- */}
                <div 
                  className="relative bg-slate-50 shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-slate-300 print:border flex flex-col"
                  style={{ 
                    width: '54mm', 
                    height: '86mm', 
                    boxSizing: 'border-box',
                    fontFamily: 'sans-serif'
                  }}
                >
                  <div className="flex-1 flex flex-col pt-3 px-3">
                    
                    <h4 className="text-[11px] font-bold text-primary-800 text-center uppercase border-b-2 border-gold-500 pb-1 mb-2">
                      Identity Card
                    </h4>

                    {/* Parent Info */}
                    <div className="text-[9px] mb-3 p-1.5 bg-white border border-slate-200 rounded text-center">
                      <p className="text-slate-500 uppercase text-[7px] font-bold">Father's Name</p>
                      <p className="font-bold text-slate-800 leading-tight mb-1">{student.fatherName}</p>
                      <p className="text-slate-500 uppercase text-[7px] font-bold border-t border-slate-100 pt-1">Emergency Contact</p>
                      <p className="font-bold text-slate-800">{student.fatherWhatsapp}</p>
                    </div>

                    {/* Terms */}
                    <div className="text-[7.5px] text-slate-600 space-y-1.5 leading-tight flex-1 px-0.5">
                      <p className="font-bold text-slate-800 text-[8px] uppercase mb-0.5">Rules & Regulations:</p>
                      <p>1. This card is the property of the school and is non-transferable.</p>
                      <p>2. Students must wear this ID card at all times within the school premises.</p>
                      <p>3. If found, please return it to the school administration office immediately.</p>
                    </div>

                    {/* Address & Signature */}
                    <div className="mt-auto mb-2 text-center">
                      <div className="w-16 border-b border-slate-800 mb-0.5 mx-auto"></div>
                      <p className="text-[8px] text-slate-800 font-bold uppercase mb-2">Principal Signature</p>
                      
                      <div className="bg-primary-800 text-white p-1.5 -mx-3 -mb-2" style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                        <p className="text-[7px] leading-tight opacity-90">{settings?.address || "School Address Here"}</p>
                        <p className="text-[7.5px] font-bold mt-0.5">{settings?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Basic Print CSS to format standard sizes */}
      <style>{`
        @media print {
          @page {
            margin: 0.5cm;
          }
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
