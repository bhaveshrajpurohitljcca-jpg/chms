import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  FileCode2, 
  ArrowLeft, 
  CheckCircle2, 
  Download, 
  ListChecks, 
  Scale, 
  ArrowRight 
} from 'lucide-react';
import { mockProblemStatements, mockHackathons } from '@/mocks/studentMockData';
import { ErrorState } from '@/components/student/StateContainer';

export const ProblemStatementDetailPage: React.FC = () => {
  const { id, problemId } = useParams<{ id: string; problemId: string }>();
  const navigate = useNavigate();

  const problem = mockProblemStatements.find(p => p.id === problemId) || mockProblemStatements[0];
  const hackathon = mockHackathons.find(h => h.id === (id || problem.hackathonId)) || mockHackathons[0];

  if (!problem) {
    return (
      <ErrorState
        title="Problem Statement Not Found"
        message="The requested problem statement sheet is invalid or missing."
        onRetry={() => navigate(`/student/hackathons/${id || ''}`)}
      />
    );
  }

  const difficultyVariants: Record<string, 'success' | 'warning' | 'danger'> = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'danger'
  };

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
                Track Sheet: {problem.id.toUpperCase()}
              </span>
              <h1 className="font-archivo text-2xl md:text-3xl font-black uppercase text-white">
                {problem.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={difficultyVariants[problem.difficulty]}>
              {problem.difficulty}
            </Badge>
            <span className="text-xs font-semibold text-accent-secondary uppercase">
              {problem.category}
            </span>
          </div>
        </div>

        {/* Detailed Overview */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/40 font-bold mb-2">Problem Summary</h3>
          <p className="text-sm text-white/80 font-light leading-relaxed">
            {problem.fullDescription}
          </p>
        </div>

        {/* Technical Requirements */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-2 text-accent-primary font-bold text-sm uppercase mb-4">
            <ListChecks size={18} />
            <span>Technical Deliverable Requirements</span>
          </div>
          <ul className="flex flex-col gap-2.5 text-xs text-white/70">
            {problem.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evaluation Criteria Weights */}
        <div>
          <div className="flex items-center gap-2 text-accent-secondary font-bold text-sm uppercase mb-4">
            <Scale size={18} />
            <span>Evaluation Matrix & Score Weights</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {problem.evaluationCriteria.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                <span className="font-mono text-lg font-bold text-accent-primary">{item.weight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => alert('Downloading official Problem Statement Specification PDF...')}
            className="h-11 px-6 text-xs flex items-center gap-2"
          >
            <Download size={16} />
            <span>Download Spec PDF</span>
          </Button>

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
