import { Menu, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { principal } = useAuth();
  return (
    <div className="h-16 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] no-print">
      <button className="md:hidden text-gray-500 hover:text-primary-600 transition-colors" onClick={onMenuClick}>
        <Menu size={24} />
      </button>
      <div className="hidden md:block text-sm font-medium text-gray-400">Principal Administration Panel</div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-800">{principal?.name || "Principal"}</p>
          <p className="text-xs text-primary-600 font-medium">{principal?.whatsapp}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
          <GraduationCap size={20} />
        </div>
      </div>
    </div>
  );
}
