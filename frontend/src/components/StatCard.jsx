export default function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-primary-50 text-primary-700",
    gold: "bg-gold-50 text-gold-700",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
