import React, { useEffect } from 'react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog = ({
  isOpen,
  onClose,
  children,
  size = 'md'
}: DialogProps) => {
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Dialog container */}
      <div 
        className={`relative w-full ${sizes[size]} rounded-[24px] bg-[#050505]/98 border border-[rgba(255,255,255,0.08)] shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-10 p-6 transform scale-100 transition-all duration-300 max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
};

export default Dialog;
