import React from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCommerce();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl border border-neutral-800 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'warning' || toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          )}

          <p className="flex-1 text-xs text-neutral-200 leading-snug">{toast.message}</p>

          <button
            onClick={() => dismissToast(toast.id)}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
