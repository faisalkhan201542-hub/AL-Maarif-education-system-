import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCog, School, CalendarCheck, CalendarX, Wallet, Coins, Megaphone } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import Loader from "../components/Loader.jsx";
import { fmtDate, fmtMoney } from "../utils/format.js";

const PIE_COLORS = ["#2563eb", "#ec4899"]; // Blue for Boys, Pink for Girls

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <Loader label="Loading dashboard..." />;

  const genderData = [
    { name: "Boys", value: data.genderStats?.boys || 0 },
    { name: "Girls", value: data.genderStats?.girls || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Principal Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of Al-Maarif Education</p>
        </div>
        <div className="px-4 py-2 bg-primary-50 text-primary-600 ring-1 ring-primary-100 rounded-xl text-sm font-semibold">
          Academic Year 2026-27
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} tone="primary" />
        <StatCard label="Total Teachers" value={data.totalTeachers} icon={UserCog} tone="gold" />
        <StatCard label="Total Classes" value={data.totalClasses} icon={School} tone="blue" />
        <StatCard label="Today's Present" value={data.todayPresent} icon={CalendarCheck} tone="primary" />
        <StatCard label="Today's Absent" value={data.todayAbsent} icon={CalendarX} tone="red" />
        <StatCard label="Pending Fees" value={fmtMoney(data.pendingFees)} icon={Wallet} tone="red" />
        <StatCard label="Collected Fees" value={fmtMoney(data.collectedFees)} icon={Coins} tone="gold" />
        <StatCard label="Announcements" value={data.announcements.length} icon={Megaphone} tone="blue" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Gender Ratio (Boys / Girls)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {data.announcements.length === 0 && <p className="text-sm text-gray-400">No announcements yet.</p>}
            {data.announcements.map((a) => (
              <div key={a._id} className="border-l-4 border-primary-500 pl-3">
                <p className="text-sm font-medium text-gray-700">{a.title}</p>
                <p className="text-xs text-gray-400">{fmtDate(a.date)} • {a.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">Recent Students</h2>
          <ul className="space-y-2">
            {data.recentStudents.map((s) => (
              <li key={s._id} className="text-sm flex justify-between">
                <Link to={`/students/${s._id}`} className="text-primary-700 hover:underline truncate">{s.name}</Link>
                <span className="text-gray-400">{s.class}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">Recent Fee Payments</h2>
          <ul className="space-y-2">
            {data.recentFees.map((f) => (
              <li key={f._id} className="text-sm flex justify-between">
                <span className="truncate">{f.student?.name}</span>
                <span className="text-gray-400">{fmtMoney(f.paidAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">Upcoming Exams</h2>
          <ul className="space-y-2">
            {data.upcomingExams.length === 0 && <p className="text-sm text-gray-400">No upcoming exams.</p>}
            {data.upcomingExams.map((e) => (
              <li key={e._id} className="text-sm flex justify-between">
                <span className="truncate">{e.title}</span>
                <span className="text-gray-400">{fmtDate(e.examDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
