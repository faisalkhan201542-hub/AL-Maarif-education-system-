import { Menu, GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { principal } = useAuth();
  return (
    <div className="h-16 bg-white/70 backdrop-blur-2xl border-b border-white/50 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] no-print">
      <button className="md:hidden text-slate-500 hover:text-primary-600 transition-colors" onClick={onMenuClick}>
        <Menu size={24} strokeWidth={1.5} />
      </button>
      <div className="hidden md:block text-sm font-semibold text-slate-400 tracking-wide uppercase">Principal Administration Panel</div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800">{principal?.name || "Principal"}</p>
          <p className="text-xs text-primary-600 font-semibold">{principal?.whatsapp}</p>
        </div>
      </div>
    </div>
  );
}
