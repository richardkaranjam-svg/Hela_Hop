"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast]
  );

  const error = useCallback(
    (message: string) => addToast(message, "error"),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error }}
    >
      {children}
      {/* Toast Render Container: top-right on desktop, top-center on mobile */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:right-4 sm:left-auto sm:w-auto sm:translate-x-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-in fade-in slide-in-from-top-2 pointer-events-auto flex transform items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all duration-200 ${
              toast.type === "success"
                ? "border-emerald-700 bg-emerald-900/95 text-white shadow-emerald-950/20"
                : toast.type === "error"
                  ? "border-red-700 bg-red-900/95 text-white shadow-red-950/20"
                  : "border-slate-700 bg-slate-900/95 text-white shadow-slate-950/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  ✓
                </span>
              )}
              {toast.type === "error" && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  ✕
                </span>
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center text-lg leading-none text-white/70 hover:text-white"
              aria-label="Dismiss toast"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
