import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  FileCode2, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Clock
} from 'lucide-react';
import { apiService } from '@/services/api';
import type { BackendHackathon, BackendRegistration } from '@/services/api';
import { ProblemStatementCard } from '@/components/student/ProblemStatementCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/student/StateContainer';

const statusVariantMap: Record<string, 'success' | 'warning' | 'primary' | 'secondary'> = {
  active: 'success',
  upcoming: 'warning',
  draft: 'secondary',
  ended: 'primary',
};

export const HackathonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<BackendHackathon | null>(null);
  const [registration, setRegistration] = useState<BackendRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError('');

        const [hackathonRes, registrationsRes] = await Promise.allSettled([
          apiService.getHackathon(id),
          apiService.getMyRegistrations(),
        ]);

        if (hackathonRes.status === 'fulfilled' && hackathonRes.value.data) {
          setHackathon(hackathonRes.value.data);
        } else if (hackathonRes.status === 'rejected') {
          throw hackathonRes.reason;
        }

        // Find if user has a registration for this hackathon
        if (registrationsRes.status === 'fulfilled' && registrationsRes.value.data) {
          const myReg = registrationsRes.value.data.find(r => r.hackathon_id === id);
          if (myReg) setRegistration(myReg);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load hackathon details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full">
        <LoadingState message="Loading hackathon details..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Hackathon Not Found"
        message={error}
        onRetry={() => navigate('/student/hackathons')}
      />
    );
  }

  if (!hackathon) {
    return (
      <ErrorState
        title="Hackathon Not Found"
        message="The requested hackathon could not be found or has been archived."
        onRetry={() => navigate('/student/hackathons')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full font-manrope">
      
      {/* Back navigation link */}
      <div>
        <button
          onClick={() => navigate('/student/hackathons')}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-accent-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <Card className="flex flex-col gap-6 border-accent-primary/20 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Badge variant={statusVariantMap[hackathon.status] || 'primary'}>
            {hackathon.status}
          </Badge>
          <span className="text-xs font-mono font-bold text-accent-primary">
            {hackathon.problem_statements.length} Problem Statement{hackathon.problem_statements.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div>
          <h1 className="font-archivo text-3xl md:text-5xl font-black uppercase text-white tracking-tight mb-2 text-glow-cyan">
            {hackathon.title}
          </h1>
          {hackathon.tagline && (
            <p className="text-base text-accent-primary/90 font-medium mb-4">
              {hackathon.tagline}
            </p>
          )}
          {hackathon.description && (
            <p className="text-sm text-[rgba(255,255,255,0.7)] font-light leading-relaxed max-w-3xl">
              {hackathon.description}
            </p>
          )}
        </div>

        {/* Timeline & Metadata bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          {hackathon.registration_deadline && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Registration Deadline</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-warning mt-1">
                <Clock size={14} />
                <span>{formatDate(hackathon.registration_deadline)}</span>
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Sprint Duration</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white mt-1">
              <Calendar size={14} className="text-accent-primary" />
              <span>{formatDate(hackathon.start_date)} – {formatDate(hackathon.end_date)}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Team Constraints</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white mt-1">
              <Users size={14} className="text-accent-secondary" />
              <span>{hackathon.min_team_size} to {hackathon.max_team_size} Members</span>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex items-center justify-end gap-4 pt-2 border-t border-white/10 flex-wrap">
          {registration ? (
            <div className="h-11 px-6 rounded-full bg-success/10 border border-success/30 text-success text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>
                Registered{registration.team ? ` — Team: ${registration.team.name}` : ''}
              </span>
            </div>
          ) : hackathon.status === 'active' ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/student/registration?hackathonId=${hackathon.id}`)}
              className="h-11 px-8 text-xs font-bold"
            >
              Register Team Now
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Problem Statements Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCode2 size={22} className="text-accent-secondary" />
            <div>
              <h3 className="font-archivo text-xl uppercase font-black text-white">Problem Statements</h3>
              <p className="text-xs text-white/60">Choose your track challenge for registration</p>
            </div>
          </div>
        </div>

        {hackathon.problem_statements.length === 0 ? (
          <EmptyState
            title="No Problem Statements Yet"
            description="Problem statements for this hackathon haven't been published yet. Check back soon."
            icon={BookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathon.problem_statements.map((ps) => (
              <ProblemStatementCard
                key={ps.id}
                problem={ps}
                onSelect={() => navigate(`/student/hackathons/${hackathon.id}/problems/${ps.id}`)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
