import React from 'react';
import Card from './card';

export interface FormWrapperProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'title'> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  cardClassName?: string;
}

export const FormWrapper = ({
  title,
  description,
  children,
  actions,
  onSubmit,
  className = '',
  cardClassName = '',
  ...props
}: FormWrapperProps) => {
  return (
    <Card className={`bg-white/[0.01] border-white/5 shadow-2xl ${cardClassName}`}>
      <form 
        onSubmit={onSubmit} 
        className={`flex flex-col gap-6 font-manrope ${className}`} 
        {...props}
      >
        {/* Form header details */}
        {(title || description) && (
          <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
            {title && (
              <h3 className="font-archivo text-sm font-bold uppercase tracking-wider text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[rgba(255,255,255,0.45)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Fields list */}
        <div className="flex flex-col gap-5">
          {children}
        </div>

        {/* Footer controls/actions */}
        {actions && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
            {actions}
          </div>
        )}
      </form>
    </Card>
  );
};

export default FormWrapper;
