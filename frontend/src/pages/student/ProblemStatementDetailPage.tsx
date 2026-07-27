import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  FileCode2, 
  ArrowLeft, 
  CheckCircle2, 
  ListChecks, 
  ArrowRight 
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendProblemStatement, BackendHackathon } from '@/services/api';
import { LoadingState, ErrorState } from '@/components/student/StateContainer';

const difficultyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
  Beginner: 'success',
  Easy: 'success',
  Medium: 'warning',
  Intermediate: 'warning',
  Hard: 'danger',
  Advanced: 'danger',
};

export const ProblemStatementDetailPage: React.FC = () => {
  const { id, problemId } = useParams<{ id: string; problemId: string }>();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<BackendHackathon | null>(null);
  const [problem, setProblem] = useState<BackendProblemStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError('');
        const res = await apiService.getHackathon(id);
        if (res.data) {
          setHackathon(res.data);
          const ps = res.data.problem_statements.find(p => p.id === problemId);
          if (ps) {
            setProblem(ps);
          } else {
            setError('Problem statement not found in this hackathon.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load problem statement.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, problemId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto w-full">
        <LoadingState message="Loading problem statement..." />
      </div>
    );
  }

  if (error || !problem || !hackathon) {
    return (
      <ErrorState
        title="Problem Statement Not Found"
        message={error || 'The requested problem statement sheet is invalid or missing.'}
        onRetry={() => navigate(`/student/hackathons/${id || ''}`)}
      />
    );
  }

  const difficultyVariant = difficultyVariants[problem.difficulty] || 'warning';

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full font-manrope">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(`/student/hackathons/${hackathon.id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-accent-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to {hackathon.title} Specs</span>
        </button>
      </div>

      {/* Main PS Document Card */}
      <Card className="flex flex-col gap-6 border-accent-primary/20">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-primary font-mono font-bold text-sm">
              <FileCode2 size={18} />
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-accent-primary block">
                Track Sheet: {problem.id.slice(0, 8).toUpperCase()}
              </span>
              <h1 className="font-archivo text-2xl md:text-3xl font-black uppercase text-white">
                {problem.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={difficultyVariant}>
              {problem.difficulty}
            </Badge>
            <span className="text-xs font-semibold text-accent-secondary uppercase">
              {problem.category}
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2">Problem Overview</h3>
          <p className="text-sm text-white/80 font-light leading-relaxed">
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
            Detailed technical requirements and evaluation criteria will be shared by coordinators closer to the hackathon start date.
            Refer to the official problem statement document when available.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10 flex-wrap">
          <Button
            variant="primary"
            onClick={() => navigate(`/student/registration?hackathonId=${hackathon.id}&problemId=${problem.id}`)}
            className="h-11 px-8 text-xs font-bold flex items-center gap-2"
          >
            <span>Register Team with this Problem Statement</span>
            <ArrowRight size={16} />
          </Button>
        </div>

      </Card>

    </div>
  );
};
