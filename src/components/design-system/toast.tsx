"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const success = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    [addToast]
  );

  const error = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    [addToast]
  );

  const warning = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    [addToast]
  );

  const info = React.useCallback(
    (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const iconConfig = {
          success: {
            icon: CheckCircle2,
            color: "text-[#059669]",
            bg: "bg-[#ECFDF5]",
            border: "border-[#A7F3D0]",
          },
          error: {
            icon: AlertCircle,
            color: "text-[#DC2626]",
            bg: "bg-[#FEF2F2]",
            border: "border-[#FECACA]",
          },
          warning: {
            icon: AlertTriangle,
            color: "text-[#D97706]",
            bg: "bg-[#FFFBEB]",
            border: "border-[#FDE68A]",
          },
          info: {
            icon: Info,
            color: "text-[#0284C7]",
            bg: "bg-[#F0F9FF]",
            border: "border-[#BAE6FD]",
          },
        }[toast.type];

        const Icon = iconConfig.icon;

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E3E7E4] bg-white p-3.5 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconConfig.bg} ${iconConfig.color}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#0F172A]">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-[#5F6B65]">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onClose(toast.id)}
              className="text-[#94A3B8] hover:text-[#0F172A] rounded p-0.5 transition-colors shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

