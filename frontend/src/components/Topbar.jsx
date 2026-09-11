import { Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Topbar({ onMenuClick }) {
  const { principal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-16 bg-white dark:bg-slate-800/70 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-700/50 dark:border-slate-800/50 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10 shadow-sm no-print transition-colors">
      <button className="md:hidden text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={onMenuClick}>
        <Menu size={24} strokeWidth={1.5} />
      </button>
      <div className="hidden md:block text-sm font-semibold text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 tracking-wide uppercase">Principal Administration Panel</div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{principal?.name || "Principal"}</p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{principal?.whatsapp}</p>
        </div>
      </div>
    </div>
  );
}
