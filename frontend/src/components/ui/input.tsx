import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, leftIcon, type = 'text', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full font-manrope">
        {label ? (
          <label htmlFor={id} className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
            {label}
          </label>
        ) : null}
        
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={id}
            className={`h-12 w-full ${leftIcon ? 'pl-11' : 'px-4'} pr-4 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-white placeholder-white/30 text-sm transition-all duration-[500ms] ease-out focus:border-accent-primary focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_12px_rgba(255,77,109,0.15)]' : ''} ${className}`}
            {...props}
          />
        </div>
        
        {error ? (
          <span className="text-xs text-danger font-medium tracking-wide">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[rgba(255,255,255,0.45)]">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
