import { useState } from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({
  src,
  name = 'Operator',
  size = 'md',
  className = ''
}: AvatarProps) => {
  const [hasError, setHasError] = useState(false);

  // Extract initials
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';

  const sizes = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold font-mono tracking-wider overflow-hidden shrink-0 border select-none ${
        sizes[size]
      } ${
        src && !hasError
          ? 'border-accent-primary/40 bg-black/40'
          : 'border-accent-primary/20 bg-accent-primary/5 text-accent-primary shadow-[0_0_10px_rgba(0,243,255,0.05)]'
      } ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
