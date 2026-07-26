import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
}

export const Badge = ({
  className = '',
  variant = 'primary',
  children,
  ...props
}: BadgeProps) => {
  
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider select-none border";

  const variants = {
    primary: "bg-[rgba(0,243,255,0.08)] text-accent-primary border-[rgba(0,243,255,0.15)] shadow-[0_0_10px_rgba(0,243,255,0.05)]",
    secondary: "bg-[rgba(255,0,193,0.08)] text-accent-secondary border-[rgba(255,0,193,0.15)] shadow-[0_0_10px_rgba(255,0,193,0.05)]",
    success: "bg-[rgba(0,255,157,0.08)] text-success border-[rgba(0,255,157,0.15)] shadow-[0_0_10px_rgba(0,255,157,0.05)]",
    warning: "bg-[rgba(255,200,87,0.08)] text-warning border-[rgba(255,200,87,0.15)] shadow-[0_0_10px_rgba(255,200,87,0.05)]",
    danger: "bg-[rgba(255,77,109,0.08)] text-danger border-[rgba(255,77,109,0.15)] shadow-[0_0_10px_rgba(255,77,109,0.05)]",
    info: "bg-[rgba(157,0,255,0.08)] text-accent-third border-[rgba(157,0,255,0.15)] shadow-[0_0_10px_rgba(157,0,255,0.05)]",
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
