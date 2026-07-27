import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  title = 'No Records Found',
  description = 'There are no active records in this view right now.',
  actionText,
  onAction,
  icon = <Inbox size={32} className="text-zinc-500" />,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center text-center p-8 md:p-12 rounded-[32px] bg-white/[0.01] border border-white/[0.04] font-manrope ${className}`}>
      <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-1.5">
        {title}
      </h4>
      <p className="text-xs text-[rgba(255,255,255,0.45)] leading-relaxed max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" onClick={onAction} className="h-10 px-5 text-xs">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
