
import { AlertCircle } from 'lucide-react';
import Button from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'System Offline',
  message = 'We encountered an error loading this sector. Please check your link or try again.',
  retryText = 'Retry Handshake',
  onRetry,
  className = ''
}: ErrorStateProps) => {
  return (
    <div className={`flex flex-col items-center text-center p-8 md:p-12 rounded-[32px] bg-danger/5 border border-danger/20 font-manrope ${className}`}>
      <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/25 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-danger animate-pulse" />
      </div>
      <h4 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-1.5">
        {title}
      </h4>
      <p className="text-xs text-[rgba(255,255,255,0.5)] leading-relaxed max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="h-10 px-5 text-xs">
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
