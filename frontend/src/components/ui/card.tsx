import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'product';
  hoverable?: boolean;
}

export const Card = ({
  className = '',
  variant = 'standard',
  hoverable = false,
  children,
  ...props
}: CardProps) => {
  // Border radius: Standard is 32px (rounded-[32px]), Product is 40px (rounded-[40px])
  const radius = variant === 'product' ? 'rounded-[40px]' : 'rounded-[32px]';
  
  const hoverEffect = hoverable
    ? 'hover:-translate-y-1 hover:border-[rgba(0,243,255,0.30)] hover:bg-[rgba(255,255,255,0.07)] hover:shadow-[0_10px_30px_rgba(0,243,255,0.05)]'
    : '';

  return (
    <div
      className={`glass-card p-6 transition-all duration-[600ms] ease-out ${radius} ${hoverEffect} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
