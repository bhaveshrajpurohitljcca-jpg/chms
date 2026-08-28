import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
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
    sm: 'max-w-md w-full',
    md: 'w-[50vw] max-w-3xl',
    lg: 'w-[75vw] max-w-[1400px]',
    xl: 'w-[90vw] max-w-[1600px]'
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-[6px] transition-opacity duration-500" 
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className={`relative w-full ${sizes[size]} rounded-dialog glass-card bg-[#050505]/95 border border-[rgba(255,255,255,0.12)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 my-auto flex flex-col gap-4`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
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
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
