export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const Loader = ({ size = 'md', fullPage = false }: LoaderProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-[3px]',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow Ring */}
      <div 
        className={`animate-spin rounded-full border-t-accent-primary border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`}
      />
      {/* Static Inner Border */}
      <div 
        className={`absolute rounded-full border-[rgba(255,255,255,0.05)] ${sizeClasses[size]} pointer-events-none`}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] gap-4 select-none">
        {spinner}
        <span className="text-xs uppercase tracking-[0.2em] text-[rgba(255,255,255,0.4)] animate-pulse">
          Loading System
        </span>
      </div>
    );
  }

  return spinner;
};

export default Loader;
