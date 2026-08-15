import React, { forwardRef } from 'react';

export interface RadioItem {
  value: string;
  label: string;
  description?: string;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: RadioItem[];
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', label, error, helperText, options, name, value, onChange, ...props }, ref) => {
    return (
      <div className={["flex flex-col gap-2 w-full font-manrope", className].filter(Boolean).join(" ")}>
        {label && (
          <span className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.65)] select-none">
            {label}
          </span>
        )}

        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 select-none ${
                  isSelected
                    ? 'bg-[rgba(0,243,255,0.03)] border-accent-primary shadow-[0_0_12px_rgba(0,243,255,0.08)]'
                    : 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.08)] hover:border-accent-primary/50'
                }`}
              >
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    ref={ref}
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={onChange}
                    className="sr-only"
                    {...props}
                  />
                  {/* Outer ring */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'border-accent-primary'
                        : 'border-[rgba(255,255,255,0.3)]'
                    }`}
                  >
                    {/* Inner dot */}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-[10px] text-[rgba(255,255,255,0.45)]">
                      {option.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
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

Radio.displayName = 'Radio';
export default Radio;
