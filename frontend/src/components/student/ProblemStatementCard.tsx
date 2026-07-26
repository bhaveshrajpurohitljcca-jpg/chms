import React from 'react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { FileCode2, ArrowRight } from 'lucide-react';
import type { StudentProblemStatement } from '@/mocks/studentMockData';

interface ProblemStatementCardProps {
  problem: StudentProblemStatement;
  onSelect?: (problem: StudentProblemStatement) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
}

export const ProblemStatementCard: React.FC<ProblemStatementCardProps> = ({
  problem,
  onSelect,
  isSelected = false,
  showSelectButton = true
}) => {
  const difficultyVariants: Record<StudentProblemStatement['difficulty'], 'success' | 'warning' | 'danger'> = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger'
  };

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
              {problem.id.toUpperCase()}
            </span>
          </div>
          <Badge variant={difficultyVariants[problem.difficulty]}>
            {problem.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-archivo text-base uppercase font-bold text-white mb-2 leading-snug">
          {problem.title}
        </h4>

        {/* Category tag */}
        <p className="text-[11px] uppercase tracking-wider text-accent-secondary font-semibold mb-3">
          Category: {problem.category}
        </p>

        {/* Short description */}
        <p className="text-xs text-[rgba(255,255,255,0.65)] font-light leading-relaxed mb-4">
          {problem.shortDescription}
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
