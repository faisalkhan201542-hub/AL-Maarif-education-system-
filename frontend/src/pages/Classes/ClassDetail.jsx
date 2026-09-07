import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import StatCard from "../../components/StatCard.jsx";
import WhatsAppButton from "../../components/WhatsAppButton.jsx";
import { fmtMoney } from "../../utils/format.js";
import { Users, CalendarCheck, CalendarX, Wallet, Award } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ClassDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/api/classes/${name}`).then((res) => setData(res.data));
  }, [name]);

  if (!data) return <Loader />;

  return (
    <div className="space-y-5">
      <button className="btn-secondary btn-sm" onClick={() => navigate("/classes")}><ArrowLeft size={14}/> All Classes</button>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Class {data.class}</h1>
        {data.classTeacher && <p className="text-sm text-gray-400">Class Teacher: {data.classTeacher}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} />
        <StatCard label="Present Today" value={data.presentToday} icon={CalendarCheck} />
        <StatCard label="Absent Today" value={data.absentToday} icon={CalendarX} tone="red" />
        <StatCard label="Pending Fees" value={fmtMoney(data.pendingFees)} icon={Wallet} tone="gold" />
        <StatCard label="Average Result" value={`${data.averageResult}%`} icon={Award} tone="blue" />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-700 mb-3">Students in Class {data.class}</h2>
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Photo</th><th className="th">Reg. No</th><th className="th">Name</th>
              <th className="th">Father Name</th><th className="th">Father WhatsApp</th><th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.students.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="td"><img src={s.photoUrl?.startsWith("http") ? s.photoUrl : `${API_URL}${s.photoUrl}`} className="w-8 h-8 rounded-full object-cover" alt={s.name} /></td>
                <td className="td font-mono text-xs">{s.registrationNumber}</td>
                <td className="td font-medium">{s.name}</td>
                <td className="td">{s.fatherName}</td>
                <td className="td">{s.fatherWhatsapp}</td>
                <td className="td">
                  <div className="flex gap-1.5">
                    <Link to={`/students/${s._id}`} className="btn-secondary btn-sm">Profile</Link>
                    <WhatsAppButton phone={s.fatherWhatsapp} label="" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
