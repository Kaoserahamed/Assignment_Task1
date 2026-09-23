'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CircleCheck, Info, X } from 'lucide-react';

export type ToastTone = 'info' | 'success';

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
}

interface ToastItem extends Required<Omit<ToastInput, 'description'>> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Access to the toast queue. Must be used inside `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context;
}

const AUTO_DISMISS_MS = 4200;

/**
 * Lightweight toast queue used for action feedback (copy, report submitted,
 * status refreshed…). The live region is polite so it never interrupts.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, tone = 'info' }: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;

      setToasts((current) => [...current.slice(-2), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-60 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto w-full max-w-[400px] animate-toast-in rounded-2xl bg-slate-900/95 px-4 py-3 text-white shadow-lg shadow-slate-900/25 ring-1 ring-white/10"
          >
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-indigo-300">
                {toast.tone === 'success' ? (
                  <CircleCheck className="size-4" />
                ) : (
                  <Info className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-5 text-slate-300">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
