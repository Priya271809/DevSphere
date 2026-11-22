import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../redux/toastSlice";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = "border-slate-700 bg-slate-900/90 text-slate-100";
        let Icon = Info;

        if (toast.type === "success") {
          borderClass = "border-emerald-500/40 bg-emerald-950/80 text-emerald-200";
          Icon = CheckCircle2;
        } else if (toast.type === "error") {
          borderClass = "border-rose-500/40 bg-rose-950/80 text-rose-200";
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-up ${borderClass}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
