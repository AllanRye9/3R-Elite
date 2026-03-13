'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const styles: Record<ToastType, { bar: string; icon: string; container: string }> = {
  success: {
    bar: 'bg-emerald-500',
    icon: 'bg-emerald-100 text-emerald-600',
    container: 'border-emerald-100',
  },
  error: {
    bar: 'bg-red-500',
    icon: 'bg-red-100 text-red-600',
    container: 'border-red-100',
  },
  info: {
    bar: 'bg-sky-500',
    icon: 'bg-sky-100 text-sky-600',
    container: 'border-sky-100',
  },
  warning: {
    bar: 'bg-amber-500',
    icon: 'bg-amber-100 text-amber-600',
    container: 'border-amber-100',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const s = styles[toast.type];
  return (
    <div
      className={`relative flex items-start gap-3 bg-white border ${s.container} rounded-xl shadow-lg p-4 pr-10 min-w-[280px] max-w-[380px] animate-slide-down`}
      role="alert"
    >
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-xl`} />
      {/* Icon */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${s.icon} flex items-center justify-center text-xs font-bold`}>
        {icons[toast.type]}
      </div>
      {/* Message */}
      <p className="text-sm text-gray-700 font-medium leading-snug pt-0.5">{toast.message}</p>
      {/* Close */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-1 right-0 h-0.5 ${s.bar} opacity-30 rounded-bl-xl`}
        style={{ animation: `shrink ${toast.duration || 4000}ms linear forwards` }}
      />
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const add = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
    timersRef.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  const value: ToastContextValue = {
    toast: add,
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
    warning: (msg) => add(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
