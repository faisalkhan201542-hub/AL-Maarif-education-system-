import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ open, title = "Are you sure?", message, onConfirm, onCancel, confirmLabel = "Delete", danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${danger ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-700"}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            {message && <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
