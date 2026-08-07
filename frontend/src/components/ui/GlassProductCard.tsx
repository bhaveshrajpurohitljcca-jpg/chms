import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Map colors for dynamic border transitions
  const accentColors = {
    cyan: '#00f3ff',
    pink: '#ff00c1',
    purple: '#9d00ff'
  };

  const resolvedColor = accentColors[accentColor];

  // Inline styling for precise 500ms border transition
  const cardStyle = {
    borderRadius: '40px',
    backgroundColor: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${isLight ? '#cbd5e1' : (isHovered ? resolvedColor : 'rgba(255, 255, 255, 0.05)')}`,
    transition: 'border-color 500ms cubic-bezier(0.4, 0, 0.2, 1), background-color 500ms, box-shadow 500ms',
    boxShadow: isLight ? 'none' : (isHovered ? `0 0 25px ${resolvedColor}1a` : 'none'),
  };

  // Icon rotation transition (from -10deg scale 1 to 0deg scale 1.1)
  const iconStyle = {
    transform: isHovered ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-10deg)',
    color: isLight ? '#0252cd' : (isHovered ? resolvedColor : 'rgba(255, 255, 255, 0.65)'),
    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), color 500ms',
  };

  return (
    <div
      style={cardStyle}
      className={`relative p-8 flex flex-col justify-between min-h-[420px] select-none group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Top 4:5 aspect ratio graphic zone */}
      <div 
        className={`w-full aspect-[4/5] rounded-[24px] ${isLight ? '' : 'bg-[#0a0a0a]'} flex items-center justify-center relative overflow-hidden mb-6`}
        style={{
          background: isLight 
            ? 'linear-gradient(to top, #e8edf5 0%, #dde3ed 100%)' 
            : 'linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(10,10,10,0.4) 100%)'
        }}
      >
        {/* Glow Accent Overlay in background */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none filter blur-[40px] rounded-[24px]"
          style={{ backgroundColor: isLight ? 'transparent' : resolvedColor }}
        />
        <Icon size={48} style={iconStyle} />
      </div>

      {/* Title & Description */}
      <div className="flex-1 flex flex-col gap-2 mb-6">
        <h4 className="font-archivo text-xl uppercase font-black tracking-tight text-white group-hover:text-glow-cyan">
          {title}
        </h4>
        <p className={`text-xs ${isLight ? 'text-[#475569]' : 'text-[rgba(255,255,255,0.45)]'} line-clamp-2 leading-relaxed`}>
          {description}
        </p>
      </div>

      {/* Bottom pricing bar */}
      <div className={`glass-surface h-16 rounded-[20px] px-6 flex items-center justify-between border ${isLight ? 'bg-white border-[#cbd5e1]' : 'border-[rgba(255,255,255,0.06)] bg-white/[0.01]'} backdrop-blur-[6px]`}>
        <div className="flex flex-col">
          <span className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-[#475569]' : 'text-[rgba(255,255,255,0.45)]'} font-semibold`}>Value</span>
          <span className="text-sm font-mono font-bold text-white">{price}</span>
        </div>

        <button 
          title="Add Action"
          className={`w-9 h-9 rounded-full ${isLight ? 'bg-[#e5e9f0] text-[#0252cd]' : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white group-hover:bg-white group-hover:text-black'} border flex items-center justify-center transition-all duration-300 group-hover:scale-105`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default GlassProductCard;
