export default function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30",
    gold: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30",
    red: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/30",
    blue: "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-500/30",
    purple: "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30",
    emerald: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
  };
  return (
    <div className="card group flex items-center gap-4 cursor-default overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 opacity-50 z-0"></div>
      <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 dark:bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
      
      <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${tones[tone]}`}>
        {Icon && <Icon size={26} strokeWidth={1.5} />}
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
