export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
