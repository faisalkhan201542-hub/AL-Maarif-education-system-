import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", subtitle = "", icon: Icon = Inbox, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500">
      <Icon size={40} className="mb-3 text-gray-300" />
      <p className="font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">{title}</p>
      {subtitle && <p className="text-sm mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
