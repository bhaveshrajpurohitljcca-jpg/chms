import React from 'react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { FileCode2, ArrowRight } from 'lucide-react';
import type { BackendProblemStatement } from '@/services/api';

interface ProblemStatementCardProps {
  problem: BackendProblemStatement;
  onSelect?: (problem: BackendProblemStatement) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

const difficultyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Easy: 'success',
  Medium: 'warning',
  Intermediate: 'warning',
  Hard: 'danger',
  Advanced: 'danger',
};

export const ProblemStatementCard: React.FC<ProblemStatementCardProps> = ({
  problem,
  onSelect,
  isSelected = false,
  showSelectButton = true,
}) => {
  const difficultyVariant = difficultyVariants[problem.difficulty] || 'warning';

  // If it's explore mode (no select button), render a horizontal row layout
  if (!showSelectButton) {
    return (
      <div 
        onClick={() => onSelect && onSelect(problem)}
        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-surface border border-white/5 hover:border-accent-primary/40 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/5 border border-accent-primary/20 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-mono text-accent-primary font-bold">
              {problem.id.slice(0, 4).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="font-archivo text-base uppercase font-bold text-white truncate max-w-full">
                {problem.title}
              </h4>
              <Badge variant={difficultyVariant} className="scale-75 origin-left">
                {problem.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-white/50 truncate max-w-full">
              {problem.description.substring(0, 100)}...
            </p>
          </div>
        </div>
        <div className="flex shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-primary group-hover:text-black transition-colors">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    );
  }

  // Original vertical card layout for Team portal selection
  return (
    <Card
      hoverable
      className={`flex flex-col justify-between h-full transition-all duration-500 ${
        isSelected ? 'border-accent-primary bg-[rgba(0,243,255,0.04)] shadow-[0_0_20px_rgba(0,243,255,0.15)]' : ''
      }`}
    >
      <div>
        {/* Top bar with ID tag & difficulty */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-accent-primary text-xs font-mono font-bold">
              <FileCode2 size={14} />
            </span>
            <span className="text-xs font-mono font-bold text-accent-primary">
              {problem.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <Badge variant={difficultyVariant}>
            {problem.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-archivo text-base uppercase font-bold text-white mb-2 leading-snug">
          {problem.title}
        </h4>

        {/* Point value */}
        <p className="text-[11px] uppercase tracking-wider text-accent-secondary font-semibold mb-3">
          {problem.points || 100} Points
        </p>

        {/* Description */}
        <p className="text-xs text-[rgba(255,255,255,0.65)] font-light leading-relaxed mb-4 line-clamp-3">
          {problem.description}
        </p>
      </div>

      {/* Action Footer */}
      {showSelectButton && onSelect ? (
        <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] mt-2">
          <Button
            variant={isSelected ? 'success' : 'secondary'}
            onClick={() => onSelect(problem)}
            className="w-full h-9 text-xs"
          >
            <span>{isSelected ? 'Selected Problem Statement' : 'View & Select Problem'}</span>
            {!isSelected && <ArrowRight size={14} />}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};
