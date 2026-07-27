
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search records...',
  className = ''
}: SearchBarProps) => {
  return (
    <div className={`relative flex items-center w-full font-manrope ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
        <Search size={16} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full pl-11 pr-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white placeholder-white/30 text-xs tracking-wide transition-all duration-[400ms] ease-out focus:border-accent-primary focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_12px_rgba(0,243,255,0.15)] focus:outline-none"
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 text-zinc-400 hover:text-white transition-colors flex items-center justify-center p-0.5"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
