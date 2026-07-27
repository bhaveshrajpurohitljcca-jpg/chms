
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { Toast, ToastType } from '@/context/ToastContext';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={16} className="text-success" />;
    case 'warning':
      return <AlertTriangle size={16} className="text-warning" />;
    case 'error':
      return <AlertCircle size={16} className="text-danger" />;
    case 'info':
    default:
      return <Info size={16} className="text-accent-primary" />;
  }
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  // Border colors matching toast type
  const borders = {
    success: 'border-success/30 hover:border-success/60 shadow-[0_0_15px_rgba(0,255,157,0.1)]',
    warning: 'border-warning/30 hover:border-warning/60 shadow-[0_0_15px_rgba(255,200,87,0.1)]',
    error: 'border-danger/30 hover:border-danger/60 shadow-[0_0_15px_rgba(255,77,109,0.1)]',
    info: 'border-accent-primary/30 hover:border-accent-primary/60 shadow-[0_0_15px_rgba(0,243,255,0.1)]',
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/80 backdrop-blur-md border text-xs text-white transition-all duration-300 font-manrope ${borders[toast.type]} animate-slide-in-right`}
    >
      <div className="flex items-center gap-2.5">
        <ToastIcon type={toast.type} />
        <span className="font-medium tracking-wide">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;
