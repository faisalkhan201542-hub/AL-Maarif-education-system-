import { NavLink } from "react-router-dom";
import {
  Gauge, GraduationCap, Building, Briefcase, CalendarCheck2, CreditCard,
  ScrollText, BookOpen, Clock, BellRing, TrendingUp, Award, MapPin, Settings, LogOut, Building2
} from "lucide-react";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: Gauge, end: true },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/classes", label: "Classes", icon: Building },
  { to: "/teachers", label: "Teachers", icon: Briefcase },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/fees", label: "Fees / Challans", icon: CreditCard },
  { to: "/exams", label: "Examinations", icon: ScrollText },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/timetable", label: "Timetable", icon: Clock },
  { to: "/announcements", label: "Announcements", icon: BellRing },
  { to: "/reports", label: "Reports", icon: TrendingUp },

  { to: "/location", label: "School Location", icon: MapPin },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 w-64 shrink-0 shadow-xl shadow-slate-900/10 no-print">
      <div className="p-4 border-b border-white/10">
        <Logo dark size={38} />
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? "bg-primary-600 text-white shadow-sm" : "hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut size={18} strokeWidth={2} /> Logout
        </button>
      </div>
    </div>
  );
}
