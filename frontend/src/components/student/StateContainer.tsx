import React from 'react';
import Loader from '@/components/ui/loader';
import Button from '@/components/ui/button';
import { AlertTriangle, FolderOpen } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading system data...' }) => (
  <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
    <Loader size="lg" />
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.5)] animate-pulse">
      {message}
    </p>
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while fetching information. Please try again.',
  onRetry
}) => (
  <div className="glass-card rounded-[32px] p-10 flex flex-col items-center justify-center text-center max-w-lg mx-auto border-danger/20">
    <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger mb-4">
      <AlertTriangle size={28} />
    </div>
    <h4 className="font-archivo text-xl uppercase font-black text-white mb-2">{title}</h4>
    <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed mb-6">{message}</p>
    {onRetry ? (
      <Button variant="secondary" onClick={onRetry} className="h-10 text-xs px-6">
        Try Again
      </Button>
    ) : null}
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen
}) => (
  <div className="glass-card rounded-[32px] p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto border-white/10">
    <div className="w-16 h-16 rounded-full bg-[rgba(0,243,255,0.05)] border border-[rgba(0,243,255,0.2)] flex items-center justify-center text-accent-primary mb-5 shadow-[0_0_20px_rgba(0,243,255,0.1)]">
      <Icon size={30} />
    </div>
    <h4 className="font-archivo text-lg uppercase font-black text-white mb-2">{title}</h4>
    <p className="text-xs text-[rgba(255,255,255,0.6)] leading-relaxed mb-6">{description}</p>
    {actionLabel && onAction ? (
      <Button variant="primary" onClick={onAction} className="h-11 px-6 text-xs">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
