import React from 'react';

import Modal from '@/components/ui/modal';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  FileCode2, 
  CheckCircle2, 
  ListChecks, 
  ArrowRight 
} from 'lucide-react';
import type { BackendProblemStatement } from '@/services/api';

const difficultyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Easy: 'success',
  Medium: 'warning',
  Intermediate: 'warning',
  Hard: 'danger',
  Advanced: 'danger',
};

interface ProblemStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: BackendProblemStatement | null;
  onRegister?: () => void;
}

export const ProblemStatementModal: React.FC<ProblemStatementModalProps> = ({
  isOpen,
  onClose,
  problem,
  onRegister
}) => {

  if (!problem) return null;

  const difficultyVariant = difficultyVariants[problem.difficulty] || 'warning';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Problem Statement Specs" size="lg">
      <div className="flex flex-col gap-6 font-manrope">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary font-mono font-bold text-lg">
              <FileCode2 size={20} />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-accent-primary block">
                Track Sheet: {problem.id.slice(0, 8).toUpperCase()}
              </span>
              <h2 className="font-archivo text-xl md:text-2xl font-black uppercase text-white">
                {problem.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={difficultyVariant}>
              {problem.difficulty}
            </Badge>
            <span className="text-xs font-semibold text-accent-secondary uppercase">
              {problem.points || 100} Points
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2">Problem Overview</h3>
          <p className="text-sm text-white/80 font-light leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {/* Max Teams info */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-white/40 uppercase tracking-wider font-semibold block">Team Capacity</span>
            <span className="text-white font-bold">Up to {problem.max_teams} teams allowed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-xs text-success font-semibold">Slots Available</span>
          </div>
        </div>

        {/* Technical Requirements placeholder */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-accent-primary font-bold text-sm uppercase mb-4">
            <ListChecks size={18} />
            <span>Technical Deliverable Requirements</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            {problem.technical_deliverable?.trim()
              || 'Detailed technical requirements and evaluation criteria will be shared by coordinators closer to the hackathon start date. Refer to the official problem statement document when available.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10 flex-wrap">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-11 px-6 text-xs font-bold"
          >
            Close
          </Button>
          {onRegister && (
            <Button
              variant="primary"
              onClick={() => {
                onRegister();
                onClose();
              }}
              className="h-11 px-8 text-xs font-bold flex items-center gap-2"
            >
              <span>Select this Track</span>
              <ArrowRight size={16} />
            </Button>
          )}
        </div>

      </div>
    </Modal>
  );
};
