import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav className={`flex items-center gap-1.5 font-manrope text-[11px] font-semibold uppercase tracking-wider text-[rgba(255,255,255,0.45)] select-none ${className}`}>
      {/* Root Home icon link */}
      <Link 
        to="/" 
        className="hover:text-accent-primary transition-colors flex items-center justify-center p-0.5 rounded"
      >
        <Home size={12} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={10} className="text-zinc-600" />
            {isLast || !item.path ? (
              <span className={isLast ? 'text-accent-primary font-bold' : ''}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-white hover:underline transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
