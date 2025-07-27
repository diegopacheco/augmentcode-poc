import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto remove after duration
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for fade out animation
    }, toast.duration || 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div 
      className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''}`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }}
    >
      <div className="toast-content">
        <span className="toast-icon">
          {toast.type === 'success' && '✓'}
          {toast.type === 'error' && '✗'}
          {toast.type === 'info' && 'ℹ'}
        </span>
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
