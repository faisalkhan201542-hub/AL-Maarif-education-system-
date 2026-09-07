import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, School, UserCog, CalendarCheck, Wallet,
  FileSpreadsheet, Award, Megaphone, BarChart3, MapPin, Settings, LogOut,
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
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/location", label: "School Location", icon: MapPin },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  return (
    <div className="h-full flex flex-col bg-primary-900 text-white w-64 shrink-0">
      <div className="p-4 border-b border-primary-800">
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
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-primary-700 text-white" : "text-primary-100 hover:bg-primary-800"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-primary-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-800"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
