import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Briefcase, Building, CalendarCheck2, CalendarOff, CreditCard, Banknote, BellRing, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import Loader from "../components/Loader.jsx";
import { fmtDate, fmtMoney } from "../utils/format.js";

const PIE_COLORS = ["#3b82f6", "#ec4899"]; // Vibrant Blue for Boys, Pink for Girls

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
      {/* Colorful Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-lg border border-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-20 -mb-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight drop-shadow-sm">Principal Dashboard</h1>
          <p className="text-blue-100 mt-1 font-medium text-sm">Overview of Al-Maarif Education System</p>
        </div>
        <div className="relative z-10 px-4 py-2 bg-white/10 backdrop-blur-md text-white ring-1 ring-white/20 rounded-xl text-sm font-bold shadow-xl">
          Academic Year 2026-27
        </div>
      </div>

      {/* Smart Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.pendingFeesCount > 0 && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-red-900/20 dark:to-rose-900/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-4 shadow-sm transition-colors">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg shadow-inner">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-300">Pending Actions Required</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                There are <strong>{data.pendingFeesCount}</strong> students with unpaid fees. Please review the fee challans.
              </p>
            </div>
          </div>
        )}
        
        {data.upcomingExams?.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-4 shadow-sm transition-colors">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg shadow-inner">
              <BellRing size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300">Upcoming Exams</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                There are <strong>{data.upcomingExams.length}</strong> upcoming exams scheduled. Ensure preparations are complete.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={GraduationCap} tone="primary" />
        <StatCard label="Total Teachers" value={data.totalTeachers} icon={Briefcase} tone="purple" />
        <StatCard label="Total Classes" value={data.totalClasses} icon={Building} tone="blue" />
        <StatCard label="Today's Present" value={data.todayPresent} icon={CalendarCheck2} tone="emerald" />
        <StatCard label="Today's Absent" value={data.todayAbsent} icon={CalendarOff} tone="red" />
        <StatCard label="Pending Fees" value={fmtMoney(data.pendingFees)} icon={CreditCard} tone="red" />
        <StatCard label="Collected Fees" value={fmtMoney(data.collectedFees)} icon={Banknote} tone="emerald" />
        <StatCard label="Announcements" value={data.announcements.length} icon={BellRing} tone="gold" />
      </div>

      {/* Historical Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        
        <div className="card border-t-4 border-t-blue-500">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Monthly Revenue Collection (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.feeTrends}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} width={60} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs.${val/1000}k`} />
              <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [fmtMoney(value), "Collected"]} contentStyle={{ backgroundColor: 'var(--tw-colors-slate-900)', borderColor: 'var(--tw-colors-slate-700)', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
              <Bar dataKey="amount" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card border-t-4 border-t-emerald-500">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Admissions Growth (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.admissionTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} width={40} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [value, "New Students"]} contentStyle={{ backgroundColor: 'var(--tw-colors-slate-900)', borderColor: 'var(--tw-colors-slate-700)', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
              <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff"}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card border-t-4 border-t-purple-500">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Attendance Trends (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.attendanceTrends}>
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => val.slice(5)} tickLine={false} axisLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} width={40} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
              <Area type="monotone" dataKey="present" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
              <Area type="monotone" dataKey="absent" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card border-t-4 border-t-pink-500">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Gender Ratio (Active Students)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} className="drop-shadow-sm" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#64748b', fontWeight: '500' }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card border-t-4 border-t-orange-500">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Class-wise Attendance (Today)</h2>
          <ResponsiveContainer width="100%" height={260}>
            {data.classWiseAttendance && data.classWiseAttendance.length > 0 ? (
              <BarChart data={data.classWiseAttendance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} width={40} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip cursor={{fill: 'transparent'}} formatter={(value, name) => [name === 'percentage' ? `${value}%` : value, name === 'percentage' ? "Attendance" : name === 'present' ? "Present" : "Absent"]} contentStyle={{ backgroundColor: 'var(--tw-colors-slate-900)', borderColor: 'var(--tw-colors-slate-700)', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="percentage" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30}>
                  {data.classWiseAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage < 50 ? '#ef4444' : entry.percentage < 75 ? '#eab308' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                No attendance marked today.
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card border-t-4 border-t-blue-400">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">Recent Students</h2>
          <ul className="space-y-3">
            {data.recentStudents.map((s) => (
              <li key={s._id} className="text-sm flex justify-between items-center group">
                <Link to={`/students/${s._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium truncate transition-colors">{s.name}</Link>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-xs font-semibold">{s.class}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-t-4 border-t-emerald-400">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">Recent Fee Payments</h2>
          <ul className="space-y-3">
            {data.recentFees.map((f) => (
              <li key={f._id} className="text-sm flex justify-between items-center text-slate-800 dark:text-slate-200">
                <span className="truncate font-medium">{f.student?.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtMoney(f.paidAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-t-4 border-t-purple-400">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">Upcoming Exams</h2>
          <ul className="space-y-3">
            {data.upcomingExams.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming exams.</p>}
            {data.upcomingExams.map((e) => (
              <li key={e._id} className="text-sm flex justify-between items-center text-slate-800 dark:text-slate-200">
                <span className="truncate font-medium pr-2">{e.title}</span>
                <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md text-xs whitespace-nowrap">{fmtDate(e.examDate)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
