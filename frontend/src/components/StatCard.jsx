export default function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600 ring-1 ring-primary-100",
    gold: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    red: "bg-red-50 text-red-500 ring-1 ring-red-100",
    blue: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
  };
  return (
    <div className="card group flex items-center gap-4 cursor-default">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tones[tone]}`}>
        {Icon && <Icon size={24} strokeWidth={1.5} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
