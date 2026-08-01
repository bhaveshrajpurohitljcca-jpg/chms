import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    
    // Base styles: pill, height (48px / h-12), transition (500ms-700ms)
    const baseStyle = "h-12 px-6 rounded-full font-manrope font-semibold text-sm transition-all duration-[600ms] cubic-bezier(0.4, 0, 0.2, 1) flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";
    
    // Color variants mapping
    const variants = {
      primary: "bg-white text-[#050505] hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)]",
      secondary: "bg-[rgba(255,255,255,0.03)] text-white border border-[rgba(255,255,255,0.15)] hover:border-accent-primary hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]",
      success: "bg-success text-[#050505] hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(0,255,157,0.35)]",
      danger: "bg-danger text-white hover:bg-opacity-90 hover:shadow-[0_0_15px_rgba(255,77,109,0.35)]",
      ghost: "bg-transparent text-white hover:bg-[rgba(255,255,255,0.05)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variants[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
