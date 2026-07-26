import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Trophy, 
  FileCode2, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Building2,
  Clock
} from 'lucide-react';
import { mockHackathons, mockProblemStatements } from '@/mocks/studentMockData';
import { ProblemStatementCard } from '@/components/student/ProblemStatementCard';
import { ErrorState } from '@/components/student/StateContainer';

export const HackathonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const hackathon = mockHackathons.find(h => h.id === id) || mockHackathons[0];
  const problemStatements = mockProblemStatements.filter(p => p.hackathonId === hackathon.id);

  if (!hackathon) {
    return (
      <ErrorState
        title="Hackathon Not Found"
        message="The requested internal college hackathon could not be found or has been archived."
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
          <Badge variant={hackathon.status === 'active' ? 'success' : 'warning'}>
            {hackathon.status}
          </Badge>
          <span className="text-xs font-mono font-bold text-accent-primary">
            Category: {hackathon.category}
          </span>
        </div>

        <div>
          <h1 className="font-archivo text-3xl md:text-5xl font-black uppercase text-white tracking-tight mb-2 text-glow-cyan">
            {hackathon.title}
          </h1>
          <p className="text-base text-accent-primary/90 font-medium mb-4">
            {hackathon.tagline}
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.7)] font-light leading-relaxed max-w-3xl">
            {hackathon.description}
          </p>
        </div>

        {/* Timeline & Metadata bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Registration Deadline</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-warning mt-1">
              <Clock size={14} />
              <span>{hackathon.registrationDeadline}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Sprint Duration</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white mt-1">
              <Calendar size={14} className="text-accent-primary" />
              <span>{hackathon.startDate} - {hackathon.endDate}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Team Constraints</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white mt-1">
              <Users size={14} className="text-accent-secondary" />
              <span>{hackathon.minTeamSize} to {hackathon.maxTeamSize} Members</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-semibold">Prize Pool</span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-success mt-1">
              <Trophy size={14} />
              <span>{hackathon.totalPrizePool}</span>
            </div>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Building2 size={16} className="text-accent-third" />
            <span>Organized by: <strong className="text-white">{hackathon.organizer}</strong></span>
          </div>

          {hackathon.isRegistered ? (
            <div className="h-11 px-6 rounded-full bg-success/10 border border-success/30 text-success text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Registered with Team Zero_Gravity</span>
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

      {/* Guidelines & Rules */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <BookOpen size={18} className="text-accent-primary" />
          <h3 className="font-archivo text-lg uppercase font-bold text-white">Sprint Rules & Guidelines</h3>
        </div>
        <ul className="flex flex-col gap-2.5 text-xs text-white/70">
          {hackathon.rules.map((rule, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-accent-primary text-[10px] font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problemStatements.map((ps) => (
            <ProblemStatementCard
              key={ps.id}
              problem={ps}
              onSelect={() => navigate(`/student/hackathons/${hackathon.id}/problems/${ps.id}`)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
