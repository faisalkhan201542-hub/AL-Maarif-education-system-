import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Building, CalendarCheck2, CalendarOff, CreditCard, Banknote, BellRing, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
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

      {/* Smart Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.pendingFeesCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Pending Actions Required</h3>
              <p className="text-sm text-red-600 mt-1">
                There are <strong>{data.pendingFeesCount}</strong> students with unpaid fees. Please review the fee challans.
              </p>
            </div>
          </div>
        )}
        
        {data.upcomingExams?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <BellRing size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-800">Upcoming Exams</h3>
              <p className="text-sm text-amber-700 mt-1">
                There are <strong>{data.upcomingExams.length}</strong> upcoming exams scheduled. Ensure preparations are complete.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={GraduationCap} tone="primary" />
        <StatCard label="Total Teachers" value={data.totalTeachers} icon={Briefcase} tone="gold" />
        <StatCard label="Total Classes" value={data.totalClasses} icon={Building} tone="blue" />
        <StatCard label="Today's Present" value={data.todayPresent} icon={CalendarCheck2} tone="primary" />
        <StatCard label="Today's Absent" value={data.todayAbsent} icon={CalendarOff} tone="red" />
        <StatCard label="Pending Fees" value={fmtMoney(data.pendingFees)} icon={CreditCard} tone="red" />
        <StatCard label="Collected Fees" value={fmtMoney(data.collectedFees)} icon={Banknote} tone="gold" />
        <StatCard label="Announcements" value={data.announcements.length} icon={BellRing} tone="blue" />
      </div>

      {/* Historical Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Monthly Revenue Collection (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.feeTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} width={60} tickFormatter={(val) => `Rs.${val/1000}k`} />
              <Tooltip formatter={(value) => [fmtMoney(value), "Collected"]} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Admissions Growth (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.admissionTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} width={40} />
              <Tooltip formatter={(value) => [value, "New Students"]} />
              <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Attendance Trends (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.attendanceTrends}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{fontSize: 12}} tickFormatter={(val) => val.slice(5)} />
              <YAxis tick={{fontSize: 12}} width={40} />
              <Tooltip />
              <Area type="monotone" dataKey="present" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPresent)" name="Present" />
              <Area type="monotone" dataKey="absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Gender Ratio (Active Students)</h2>
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
