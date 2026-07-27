
import Modal from './modal';
import Button from './button';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false
}: ConfirmationModalProps) => {

  const icons = {
    danger: <AlertCircle size={24} className="text-danger animate-pulse" />,
    warning: <AlertTriangle size={24} className="text-warning animate-bounce" />,
    primary: <HelpCircle size={24} className="text-accent-primary" />
  };

  const confirmVariants = {
    danger: 'danger' as const,
    warning: 'primary' as const, // We can map warning button to primary
    primary: 'primary' as const
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="flex flex-col items-center gap-4 text-center py-4 font-manrope">
        <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
          {icons[variant]}
        </div>
        <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed px-2">
          {message}
        </p>
        
        <div className="flex gap-3 w-full mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 h-11"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[variant]}
            onClick={onConfirm}
            className="flex-1 h-11"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
