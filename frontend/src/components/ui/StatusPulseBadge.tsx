export interface StatusPulseBadgeProps {
  text?: string;
  className?: string;
}

export const StatusPulseBadge = ({ text = "System: Active", className = "" }: StatusPulseBadgeProps) => {
  return (
    <div 
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full select-none font-manrope font-semibold text-[10px] uppercase tracking-[0.2em] bg-[rgba(0,243,255,0.08)] border border-[rgba(0,243,255,0.25)] text-accent-primary shadow-[0_0_15px_rgba(0,243,255,0.08)] ${className}`}
    >
      <div className="relative flex h-2 w-2">
        {/* Pulsating Ring */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
        {/* Core Dot */}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
      </div>
      <span>{text}</span>
    </div>
  );
};

export default StatusPulseBadge;
