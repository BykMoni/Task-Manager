// client/src/components/Toasts.js
import React from 'react';
import { useToast } from '../contexts/ToastContext';

export default function Toasts() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="toast-root" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`} onClick={() => dismiss(t.id)}>
          <div className="toast-body">
            <div className="toast-message">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
