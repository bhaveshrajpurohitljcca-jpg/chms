import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, helperText, id, checked, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full font-manrope">
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <div className="relative flex items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={id}
              checked={checked}
              className="sr-only"
              {...props}
            />
            {/* Styled Checkbox box */}
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
                checked
                  ? 'bg-accent-primary border-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.35)]'
                  : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.15)] hover:border-accent-primary'
              }`}
            >
              {checked && <Check size={12} className="text-black stroke-[3]" />}
            </div>
          </div>
          {label && (
            <span className="text-xs font-semibold text-white tracking-wide">
              {label}
            </span>
          )}
        </label>

        {error ? (
          <span className="text-xs text-danger font-medium tracking-wide pl-8">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-[rgba(255,255,255,0.45)] pl-8">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
