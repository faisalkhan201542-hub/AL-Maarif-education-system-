import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, School, UserCog, CalendarCheck, Wallet,
  FileSpreadsheet, Award, Megaphone, BarChart3, MapPin, Settings, LogOut,
  BookOpen, Clock
} from "lucide-react";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/students", label: "Students", icon: Users },
  { to: "/classes", label: "Classes", icon: School },
  { to: "/teachers", label: "Teachers", icon: UserCog },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/fees", label: "Fees / Challans", icon: Wallet },
  { to: "/exams", label: "Examinations", icon: FileSpreadsheet },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/timetable", label: "Timetable", icon: Clock },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/certificate", label: "Certificate", icon: FileSpreadsheet },
  { to: "/location", label: "School Location", icon: MapPin },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-primary-900 to-primary-800 text-white w-64 shrink-0 shadow-xl shadow-primary-900/20 no-print">
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
                isActive ? "bg-white/10 text-white shadow-sm shadow-black/5" : "text-primary-100 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-100 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
