import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Logo from "../../components/Logo.jsx";
import { useSettings } from "../../context/SettingsContext.jsx";
import { fmtDate, statusBadgeClass } from "../../utils/format.js";

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

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between no-print">
        <button className="btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={14}/> Back</button>
        <button className="btn-primary" onClick={() => window.print()}><Printer size={14}/> Print Result</button>
      </div>

      <div className="card print-area border-2 border-primary-700">
        <div className="flex flex-col items-center text-center border-b pb-4 mb-4">
          <Logo size={48} showName={false} />
          <h1 className="text-xl font-bold text-primary-800 mt-2">{settings?.schoolName}</h1>
          <p className="text-sm text-gray-500">{settings?.address}</p>
        </div>

        <div className="flex gap-4 items-center border rounded-lg p-4 mb-4">
          <img src={photo} alt={s.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm flex-1">
            <p><span className="text-gray-400">Student Name: </span>{s.name}</p>
            <p><span className="text-gray-400">Father Name: </span>{s.fatherName}</p>
            <p><span className="text-gray-400">Registration No: </span><span className="font-mono">{s.registrationNumber}</span></p>
            <p><span className="text-gray-400">Class: </span>{result.class} &nbsp; Roll No: {s.rollNumber}</p>
            <p className="col-span-2"><span className="text-gray-400">Examination: </span>{result.exam.title}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-4 border">
          <thead><tr className="bg-gray-50">
            <th className="text-left px-3 py-2 border-b">Subject</th>
            <th className="text-right px-3 py-2 border-b">Total Marks</th>
            <th className="text-right px-3 py-2 border-b">Obtained</th>
            <th className="text-right px-3 py-2 border-b">Grade</th>
          </tr></thead>
          <tbody>
            {result.subjects.map((sub) => (
              <tr key={sub.subject}>
                <td className="px-3 py-1.5 border-b">{sub.subject}</td>
                <td className="px-3 py-1.5 border-b text-right">{sub.totalMarks}</td>
                <td className="px-3 py-1.5 border-b text-right">{sub.obtainedMarks}</td>
                <td className="px-3 py-1.5 border-b text-right">{sub.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center text-sm">
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">Total Marks</p><p className="font-bold">{result.totalMarks}</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">Obtained</p><p className="font-bold">{result.obtainedMarks}</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">Percentage</p><p className="font-bold">{result.percentage}%</p></div>
          <div className="bg-gray-50 rounded-lg p-3"><p className="text-gray-400 text-xs">Grade</p><p className="font-bold">{result.grade}</p></div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className={statusBadgeClass(result.status)}>{result.status}</span>
          <p className="text-sm">Position: <span className="font-bold">{result.position || "-"}</span></p>
        </div>

        {result.remarks && <p className="text-sm mb-4"><span className="text-gray-400">Remarks: </span>{result.remarks}</p>}

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
