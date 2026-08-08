import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';

export interface GlassProductCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
  accentColor?: 'cyan' | 'pink' | 'purple';
  className?: string;
  onClick?: () => void;
}

export const GlassProductCard = ({
  icon: Icon,
  title,
  description,
  price,
  accentColor = 'cyan',
  className = '',
  onClick
}: GlassProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const accentColors = {
    cyan: '#00f3ff',
    pink: '#ff00c1',
    purple: '#9d00ff'
  };

  const resolvedColor = accentColors[accentColor];

  // Dark mode: dynamic border/glow on hover; Light mode: static clean border
  const cardStyle = {
    borderRadius: '40px',
    transition: 'border-color 500ms cubic-bezier(0.4, 0, 0.2, 1), background-color 500ms, box-shadow 500ms',
  };

  const iconStyle = {
    transform: isHovered ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-10deg)',
    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), color 500ms',
  };

  return (
    <div
      style={cardStyle}
      className={`relative p-8 flex flex-col justify-between min-h-[420px] select-none group cursor-pointer
        bg-white dark:bg-[rgba(255,255,255,0.03)]
        border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.05)]
        ${isHovered ? 'dark:border-[color:var(--accent-hover)] dark:shadow-[0_0_25px_rgba(0,243,255,0.1)]' : ''}
        ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Top graphic zone */}
      <div
        className="w-full aspect-[4/5] rounded-[24px] flex items-center justify-center relative overflow-hidden mb-6
          bg-gradient-to-t from-[#e8edf5] to-[#dde3ed]
          dark:bg-gradient-to-t dark:from-[#050505] dark:to-[rgba(10,10,10,0.4)]"
      >
        {/* Glow Accent Overlay in background (Dark mode only) */}
        <div
          className="hidden dark:block absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none filter blur-[40px] rounded-[24px]"
          style={{ backgroundColor: resolvedColor }}
        />
        <Icon size={48} style={iconStyle} className="text-[#0252cd] dark:text-accent-primary" />
      </div>

      {/* Title & Description */}
      <div className="flex-1 flex flex-col gap-2 mb-6">
        <h4 className="font-archivo text-xl uppercase font-black tracking-tight text-[#0f172a] dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-[#475569] dark:text-[rgba(255,255,255,0.45)] font-medium line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom bar */}
      <div className="h-16 rounded-[20px] px-6 flex items-center justify-between border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.06)] bg-[#f8fafc] dark:bg-white/[0.01]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[#475569] dark:text-[rgba(255,255,255,0.45)] font-bold">Status</span>
          <span className="text-sm font-mono font-bold text-[#0252cd] dark:text-white">{price}</span>
        </div>

        <button
          title="Inspect"
          className="w-9 h-9 rounded-full bg-[#0252cd] text-white dark:bg-white/5 dark:border dark:border-white/10 dark:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 dark:group-hover:bg-white dark:group-hover:text-black"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default GlassProductCard;
