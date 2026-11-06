import React, { useState, useEffect } from 'react';
import { notificationService } from '../../data/services/notificationService';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastBanner() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(toast => {
      setToasts(prev => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    });

    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
        let borderClass = 'border-indigo-100 bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          borderClass = 'border-emerald-100 bg-white';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-100 bg-white';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-100 bg-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-soft-card border ${borderClass} flex items-start gap-3 transform transition-all animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-[#1E1B2E] tracking-tight">{toast.title}</h5>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-[#A19DB8] hover:text-[#1E1B2E] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
