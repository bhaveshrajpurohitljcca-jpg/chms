export interface StatusPulseBadgeProps {
  text?: string;
  className?: string;
}

export const StatusPulseBadge = ({ text = "System: Active", className = "" }: StatusPulseBadgeProps) => {
  return (
    <div 
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full select-none font-manrope font-semibold text-[10px] uppercase tracking-[0.2em] bg-[#dbe4ee] dark:bg-[rgba(0,243,255,0.08)] border border-[#b0c4de] dark:border-[rgba(0,243,255,0.25)] text-[#0252cd] dark:text-accent-primary ${className}`}
    >
      <div className="relative flex h-2 w-2">
        {/* Pulsating Ring (Dark mode only) */}
        <span className="hidden dark:inline-flex animate-ping absolute h-full w-full rounded-full bg-accent-primary opacity-75"></span>
        {/* Core Dot */}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0252cd] dark:bg-accent-primary"></span>
      </div>
      <span className="font-bold">{text}</span>
    </div>
  );
};

export default StatusPulseBadge;
