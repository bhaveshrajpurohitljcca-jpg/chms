import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options, children, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full font-manrope">
        {label ? (
          <label htmlFor={id} className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
            {label}
          </label>
        ) : null}

        <div className="relative w-full">
          <select
            ref={ref}
            id={id}
            className={`h-12 w-full px-4 rounded-input bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.10)] text-white placeholder-white/30 text-sm transition-all duration-[500ms] ease-out focus:border-accent-primary focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_12px_rgba(255,77,109,0.15)]' : ''} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#050505] text-white">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          {/* Custom Chevron Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = 'Select';
export default Select;
