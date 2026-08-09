import React from 'react';
import Modal from '@/components/ui/modal';
import { Award, CheckCircle2, Star, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import type { EvaluationRecord } from '@/services/api';

interface EvaluationScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: EvaluationRecord[];
  projectTitle?: string;
}

export const EvaluationScorecardModal: React.FC<EvaluationScorecardModalProps> = ({
  isOpen,
  onClose,
  evaluations,
  projectTitle
}) => {
  if (!isOpen) return null;

  const primaryEval = evaluations && evaluations.length > 0 ? evaluations[0] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Evaluation Scorecard" size="lg">
      <div className="font-manrope min-h-[300px] flex flex-col gap-6 select-none">
        
        {!primaryEval ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <AlertCircle size={36} className="text-white/20" />
            <p className="text-sm text-white/40">No detailed evaluation records available yet.</p>
          </div>
        ) : (
          <>
            {/* Header Banner */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-br from-accent-primary/10 via-purple-500/10 to-transparent border border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-accent-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">Evaluation Complete</span>
                  </div>
                  <h3 className="font-archivo text-xl font-black text-white uppercase tracking-tight">
                    {projectTitle || 'Project Scorecard'}
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    Evaluated on {primaryEval.submitted_at ? new Date(primaryEval.submitted_at).toLocaleDateString() : 'Recent Session'}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
                  <span className="text-[9px] uppercase font-bold text-white/40">Total Score</span>
                  <span className="font-archivo text-3xl font-black text-accent-primary">
                    {primaryEval.total_score} <span className="text-xs font-light text-white/40">/ 100</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Scores Breakdown Grid */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                <Star size={14} className="text-accent-primary" />
                Criteria Score Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">Technical</span>
                  <span className="font-mono text-lg font-bold text-white">{primaryEval.score_technical ?? 0} <span className="text-xs text-white/30">/10</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">UI/UX</span>
                  <span className="font-mono text-lg font-bold text-white">{primaryEval.score_uiux ?? 0} <span className="text-xs text-white/30">/10</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">Impact</span>
                  <span className="font-mono text-lg font-bold text-white">{primaryEval.score_impact ?? 0} <span className="text-xs text-white/30">/10</span></span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">Presentation</span>
                  <span className="font-mono text-lg font-bold text-white">{primaryEval.score_presentation ?? 0} <span className="text-xs text-white/30">/10</span></span>
                </div>
              </div>
            </div>

            {/* Written Judge Feedback */}
            {primaryEval.feedback && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-widest text-accent-primary font-bold flex items-center gap-1.5">
                  <MessageSquare size={13} /> Judge Review Summary
                </span>
                <p className="text-xs text-white/80 leading-relaxed italic">
                  "{primaryEval.feedback}"
                </p>
              </div>
            )}

            {/* Structured Feedback: Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {primaryEval.strengths && (
                <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-success flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Key Strengths
                  </span>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {primaryEval.strengths}
                  </p>
                </div>
              )}
              {primaryEval.weaknesses && (
                <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-warning flex items-center gap-1.5">
                    <Award size={13} /> Areas to Improve
                  </span>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {primaryEval.weaknesses}
                  </p>
                </div>
              )}
            </div>

            {/* Actionable Suggestions */}
            {primaryEval.suggestions && (
              <div className="p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/20 flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-accent-primary flex items-center gap-1.5">
                  💡 Actionable Suggestions
                </span>
                <p className="text-xs text-white/70 leading-relaxed">
                  {primaryEval.suggestions}
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </Modal>
  );
};
