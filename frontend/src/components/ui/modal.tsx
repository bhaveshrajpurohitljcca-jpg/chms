import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps) => {
  // Prevent scrolling behind open modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-[6px] transition-opacity duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className={`relative w-full ${sizes[size]} rounded-dialog glass-card bg-[#050505]/95 border border-[rgba(255,255,255,0.12)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 transform scale-100 transition-transform duration-500 ease-out flex flex-col gap-4 max-h-[90vh]`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
          {title ? (
            <h3 className="font-archivo text-lg uppercase tracking-wider font-black text-white">
              {title}
            </h3>
          ) : <div />}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.65)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] hover:border-accent-primary transition-all duration-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
