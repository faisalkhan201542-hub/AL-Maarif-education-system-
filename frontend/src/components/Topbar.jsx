import { Menu, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { principal } = useAuth();
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <button className="md:hidden text-gray-500" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      <div className="hidden md:block text-sm text-gray-400">Principal Administration Panel</div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">{principal?.name || "Principal"}</p>
          <p className="text-xs text-gray-400">{principal?.whatsapp}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
          <GraduationCap size={18} />
        </div>
      </div>
    </div>
  );
}
