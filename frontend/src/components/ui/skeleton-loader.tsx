

export interface SkeletonLoaderProps {
  variant?: 'text' | 'rect' | 'circle' | 'card';
  className?: string;
}

export const SkeletonLoader = ({
  variant = 'text',
  className = ''
}: SkeletonLoaderProps) => {
  const baseStyle = "animate-pulse bg-white/[0.03] border border-white/[0.04]";

  const styles = {
    text: 'h-3.5 w-3/4 rounded-md',
    rect: 'h-24 w-full rounded-2xl',
    circle: 'w-10 h-10 rounded-full',
    card: 'h-40 w-full rounded-[32px] p-6 flex flex-col gap-3'
  };

  if (variant === 'card') {
    return (
      <div className={`${styles.card} ${baseStyle} ${className}`}>
        <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
        <div className="h-6 w-2/3 rounded bg-white/[0.05] mt-1" />
        <div className="flex gap-2 mt-auto">
          <div className="h-5 w-16 rounded bg-white/[0.05]" />
          <div className="h-5 w-16 rounded bg-white/[0.05]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles[variant]} ${baseStyle} ${className}`} />
  );
};

export default SkeletonLoader;
