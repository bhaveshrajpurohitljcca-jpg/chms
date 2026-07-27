import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full font-manrope">
        {label ? (
          <label htmlFor={id} className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={id}
          className={`w-full min-h-[100px] p-3 rounded-input bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.10)] text-white placeholder-white/30 text-sm transition-all duration-[500ms] ease-out focus:border-accent-primary focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-y ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_12px_rgba(255,77,109,0.15)]' : ''} ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
export default Textarea;
