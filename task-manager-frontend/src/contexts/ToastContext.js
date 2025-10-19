// client/src/contexts/ToastContext.js
import React, { createContext, useContext, useCallback, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast = { id, message, type: opts.type || 'info', duration: opts.duration || 3200 };
    setToasts(t => [toast, ...t]);

    // auto remove
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, toast.duration + 200);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
