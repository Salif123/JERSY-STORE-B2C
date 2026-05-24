'use client';

import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

// Global toast store
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3500);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Quick access export helper
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast(msg, 'success'),
  error: (msg: string) => useToastStore.getState().addToast(msg, 'error'),
  info: (msg: string) => useToastStore.getState().addToast(msg, 'info'),
};

// UI Component to render the toasts (mounted at root layout)
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((item) => {
        const icons = {
          success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
          error: <AlertTriangle className="h-5 w-5 text-rose-400" />,
          info: <Info className="h-5 w-5 text-blue-400" />,
        };

        const bgColors = {
          success: 'bg-slate-900 border-emerald-500/30 text-slate-100',
          error: 'bg-slate-900 border-rose-500/30 text-slate-100',
          info: 'bg-slate-900 border-blue-500/30 text-slate-100',
        };

        return (
          <div
            key={item.id}
            className={clsx(
              'pointer-events-auto flex items-start justify-between border p-4 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5',
              bgColors[item.type]
            )}
          >
            <div className="flex gap-3 items-start">
              <span className="mt-0.5">{icons[item.type]}</span>
              <p className="text-sm font-medium">{item.message}</p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-slate-200 ml-4 focus:outline-none transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
